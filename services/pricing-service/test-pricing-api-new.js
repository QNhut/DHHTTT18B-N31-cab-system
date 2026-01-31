// test-pricing-api-new.js
const http = require('http');

function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Health Check Response:', JSON.parse(data));
      testPricingEstimateOld();
    });
  });

  req.on('error', (err) => {
    console.error('Health check error:', err.message);
  });

  req.end();
}

// Test old format (specific ride type)
function testPricingEstimateOld() {
  const postData = JSON.stringify({
    ride_type: "car",
    distance_km: 5.2,
    estimated_travel_time_minutes: 15,
    demand_level: "medium"
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/pricing/estimate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n=== OLD FORMAT (Specific Ride Type) ===');
      console.log('Pricing Response:', JSON.parse(data));
      testPricingEstimateNew();
    });
  });

  req.on('error', (err) => {
    console.error('Pricing estimate error:', err.message);
  });

  req.write(postData);
  req.end();
}

// Test new format (all ride types with addresses) 
function testPricingEstimateNew() {
  console.log('\n=== Testing NEW FORMAT (All Ride Types with Addresses) ===');
  
  // Try simpler addresses first
  const postData = JSON.stringify({
    start_address: "District 1, Ho Chi Minh City, Vietnam",
    end_address: "Tan Son Nhat Airport, Ho Chi Minh City, Vietnam", 
    demand_level: "medium"
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/pricing/estimate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Pricing Response:', JSON.stringify(response, null, 2));
      } catch (err) {
        console.log('Raw response:', data);
        console.error('JSON parse error:', err.message);
      }
      
      // Test with Vietnamese addresses as fallback
      testVietnameseAddresses();
    });
  });

  req.on('error', (err) => {
    console.error('New pricing estimate error:', err.message);
    testVietnameseAddresses();
  });

  req.write(postData);
  req.end();
}

// Test with Vietnamese addresses
function testVietnameseAddresses() {
  console.log('\n=== Testing with Vietnamese Addresses ===');
  
  const postData = JSON.stringify({
    start_address: "268 Lý Thường Kiệt, Quận 10, TP.HCM",
    end_address: "Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM",
    demand_level: "medium"
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/pricing/estimate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Vietnamese address response status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Vietnamese Address Response:', JSON.stringify(response, null, 2));
      } catch (err) {
        console.log('Raw response:', data);
        console.error('JSON parse error:', err.message);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Vietnamese address test error:', err.message);
  });

  req.write(postData);
  req.end();
}

console.log('Testing Pricing Service API on port 3002...');
testHealthCheck();