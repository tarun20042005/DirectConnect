/**
 * Format phone number to Indian format with +91 country code
 */
export function formatIndianPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Handle different formats
  if (cleaned.length === 10) {
    // Just 10 digits, add +91
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    // Already has 91 prefix
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && phone.includes("+91")) {
    // Has +91 with non-digits
    const digits = cleaned.slice(2); // Remove 91
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  
  // Return as-is if format is unclear
  return phone;
}

/**
 * Validate Indian phone number (10 digits, can have +91 prefix)
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  
  // Must be 10 digits or 12 digits (with 91 prefix)
  if (cleaned.length === 10) {
    // First digit should be 6, 7, 8, or 9 for mobile
    return /^[6789]\d{9}$/.test(cleaned);
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return /^91[6789]\d{9}$/.test(cleaned);
  }
  
  return false;
}
