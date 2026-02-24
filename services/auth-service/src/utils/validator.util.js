export const validateRegisterInput = ({
  name,
  email,
  password,
  phone
}) => {
  const nameRegex =
  /^([A-ZÀ-Ỹ][a-zà-ỹ]{0,})(\s[A-ZÀ-Ỹ][a-zà-ỹ]{0,})+$/;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[A-Z]).{8,}$/;

  const phoneRegex =
    /^0\d{9}$/;

  if (!nameRegex.test(name)) {
    throw new Error(
      "Name must start with uppercase letters and have at least 2 words"
    );
  }

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters and contain 1 uppercase letter"
    );
  }

  if (!phoneRegex.test(phone)) {
    throw new Error("Invalid phone number");
  }
};