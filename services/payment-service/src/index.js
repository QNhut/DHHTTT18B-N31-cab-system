/**
 * VNPay Sandbox - Native Node.js (no express)
 * Fix signature to match VNPay official sample:
 * - hashData MUST be built from urlencode(key)=urlencode(value) joined by &
 *   (same as VNPay PHP sample in docs)
 *
 * Endpoints:
 *  - POST /payments/vnpay/create
 *  - GET  /payments/vnpay/return
 *  - GET  /payments/vnpay/ipn
 *  - GET  /health
 */
require("dotenv").config();

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.example") });


const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

// ================== CONFIG ==================
const PORT = process.env.PORT || 8088;
const VNP_TMN_CODE = process.env.VNP_TMN_CODE;
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const VNP_URL = process.env.VNP_URL ;

const DEFAULT_RETURN_URL = process.env.VNP_RETURN_URL ;

const DEBUG = process.env.DEBUG_VNPAY ;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL ;

// ================== UTILS ==================
function logDebug(...args) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatVnpDate(d = new Date()) {
  // yyyymmddHHMMss
  return (
    d.getFullYear().toString() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds())
  );
}

function normalizeIp(ip) {
  // sandbox đôi khi nhạy IPv6 localhost => ép về IPv4 localhost
  if (!ip) return "127.0.0.1";
  if (ip === "::1") return "127.0.0.1";
  // Node có thể trả "::ffff:127.0.0.1"
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return normalizeIp(xff.split(",")[0].trim());
  return normalizeIp(req.socket.remoteAddress || "");
}

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== "") sorted[k] = v;
    });
  return sorted;
}

function hmacSHA512(secret, data) {
  return crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");
}

// PHP urlencode: space => +
function urlencodeLikePHP(str) {
  return encodeURIComponent(str).replace(/%20/g, "+");
}

// ✅ IMPORTANT:
// VNPay official sample builds BOTH hashdata and query using urlencode(key)=urlencode(value)
// hashdata joins by '&' (no trailing &)
function buildEncodedPairs(paramsSorted) {
  return Object.keys(paramsSorted).map((k) => {
    const key = urlencodeLikePHP(k);
    const val = urlencodeLikePHP(String(paramsSorted[k]));
    return `${key}=${val}`;
  });
}

function buildHashData(paramsSorted) {
  // hashData: encoded pairs joined by &
  return buildEncodedPairs(paramsSorted).join("&");
}

function buildQueryString(paramsSorted) {
  // querystring: encoded pairs joined by &
  return buildEncodedPairs(paramsSorted).join("&");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

// Optional: call other service (Order Service)
function postJson(urlStr, payload) {
  return new Promise((resolve, reject) => {
    if (!urlStr) return resolve({ skipped: true });

    const u = new URL(urlStr);
    const body = JSON.stringify(payload);

    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => resolve({ status: res.statusCode, body: raw }));
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ================== CREATE PAYMENT URL ==================
function createVnpayPaymentUrl(input, req) {
  const { orderId, amount, orderInfo, orderType, bankCode, locale, returnUrl } =
    input;

  if (!orderId) throw new Error("orderId is required");
  if (!amount || Number(amount) <= 0) throw new Error("amount must be > 0");

  // TxnRef must be unique per day :contentReference[oaicite:2]{index=2}
  const txnRef = `${orderId}_${Date.now()}`;

  const now = new Date();
  const createDate = formatVnpDate(now);

  // ExpireDate is required :contentReference[oaicite:3]{index=3}
  const expire = new Date(Date.now() + 15 * 60 * 1000);
  const expireDate = formatVnpDate(expire);

  // OrderInfo: tiếng Việt không dấu, hạn chế ký tự đặc biệt :contentReference[oaicite:4]{index=4}
  const safeOrderInfo = orderInfo || `Thanh toan ${orderId}`;

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Locale: locale || "vn",
    vnp_CurrCode: "VND",

    vnp_TxnRef: txnRef,
    vnp_OrderInfo: safeOrderInfo,
    vnp_OrderType: orderType || "billpayment",

    // amount * 100 :contentReference[oaicite:5]{index=5}
    vnp_Amount: Math.round(Number(amount) * 100),

    vnp_ReturnUrl: returnUrl || DEFAULT_RETURN_URL,
    vnp_IpAddr: getClientIp(req),

    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) vnp_Params.vnp_BankCode = bankCode;

  const sorted = sortObject(vnp_Params);

  // ✅ SIGNATURE MUST USE ENCODED hashData (like VNPay sample) :contentReference[oaicite:6]{index=6}
  const hashData = buildHashData(sorted);
  const secureHash = hmacSHA512(VNP_HASH_SECRET, hashData);

  const finalParams = { ...sorted, vnp_SecureHash: secureHash };
  const queryString = buildQueryString(finalParams);
  const paymentUrl = `${VNP_URL}?${queryString}`;

  // DEBUG
  logDebug("CREATE input =", input);
  logDebug("CREATE ip =", sorted.vnp_IpAddr);
  logDebug("CREATE sorted params (no hash) =", sorted);
  logDebug("CREATE hashData (ENCODED) =", hashData);
  logDebug("CREATE secureHash =", secureHash);
  logDebug("CREATE paymentUrl =", paymentUrl);

  return { paymentUrl, txnRef, hashData, secureHash };
}

// ================== VERIFY RETURN/IPN ==================
function verifyVnpayQuery(queryObj) {
  const vnp_Params = { ...queryObj };

  const receivedSecureHash = (vnp_Params.vnp_SecureHash || "").trim();
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const sorted = sortObject(vnp_Params);
  const hashData = buildHashData(sorted);
  const expectedSecureHash = hmacSHA512(VNP_HASH_SECRET, hashData);

  const valid =
    receivedSecureHash.toLowerCase() === expectedSecureHash.toLowerCase();

  logDebug("VERIFY received params =", queryObj);
  logDebug("VERIFY hashData (ENCODED) =", hashData);
  logDebug("VERIFY receivedSecureHash =", receivedSecureHash);
  logDebug("VERIFY expectedSecureHash =", expectedSecureHash);
  logDebug("VERIFY valid =", valid);

  return { valid, hashData, receivedSecureHash, expectedSecureHash };
}

// ================== SERVER ==================
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && u.pathname === "/health") {
    return sendJson(res, 200, { ok: true, now: new Date().toISOString() });
  }

  if (req.method === "POST" && u.pathname === "/payments/vnpay/create") {
    try {
      const body = await readJsonBody(req);

      // Optional: reserve payment status in Order Service
      postJson(ORDER_SERVICE_URL, {
        orderId: body.orderId,
        amount: body.amount,
        provider: "vnpay",
        status: "PENDING",
      }).catch((e) => logDebug("ORDER_SERVICE call failed:", e.message));

      const { paymentUrl, txnRef } = createVnpayPaymentUrl(body, req);
      return sendJson(res, 200, { paymentUrl, txnRef, amount: body.amount });
    } catch (e) {
      return sendJson(res, 400, { error: e.message });
    }
  }

  if (req.method === "GET" && u.pathname === "/payments/vnpay/return") {
    const query = Object.fromEntries(u.searchParams.entries());
    const verify = verifyVnpayQuery(query);

    const responseCode = query.vnp_ResponseCode;
    const paid = verify.valid && responseCode === "00"; // success code :contentReference[oaicite:7]{index=7}

    postJson(ORDER_SERVICE_URL, {
      orderId: query.vnp_TxnRef,
      provider: "vnpay",
      status: paid ? "PAID" : "FAILED",
      source: "RETURN",
      raw: query,
    }).catch((e) => logDebug("ORDER_SERVICE call failed:", e.message));

    return sendJson(res, 200, {
      type: "RETURN",
      paid,
      responseCode,
      validSignature: verify.valid,
      debug: DEBUG
        ? {
            hashData: verify.hashData,
            receivedSecureHash: verify.receivedSecureHash,
            expectedSecureHash: verify.expectedSecureHash,
          }
        : undefined,
      query,
    });
  }

  if (req.method === "GET" && u.pathname === "/payments/vnpay/ipn") {
    const query = Object.fromEntries(u.searchParams.entries());
    const verify = verifyVnpayQuery(query);

    const responseCode = query.vnp_ResponseCode;
    const paid = verify.valid && responseCode === "00";

    postJson(ORDER_SERVICE_URL, {
      orderId: query.vnp_TxnRef,
      provider: "vnpay",
      status: paid ? "PAID" : "FAILED",
      source: "IPN",
      raw: query,
    }).catch((e) => logDebug("ORDER_SERVICE call failed:", e.message));

    return sendJson(res, 200, {
      RspCode: verify.valid ? "00" : "97",
      Message: verify.valid ? "Confirm Success" : "Invalid Signature",
      debug: DEBUG
        ? {
            hashData: verify.hashData,
            receivedSecureHash: verify.receivedSecureHash,
            expectedSecureHash: verify.expectedSecureHash,
          }
        : undefined,
    });
  }

  return sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Payment Service listening: http://localhost:${PORT}`);
  console.log(`- POST  /payments/vnpay/create`);
  console.log(`- GET   /payments/vnpay/return`);
  console.log(`- GET   /payments/vnpay/ipn`);
  console.log(`- GET   /health`);
});
