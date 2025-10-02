export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^\d{5,6}$/;
  return pincodeRegex.test(pincode);
}
