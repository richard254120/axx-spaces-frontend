// Input validation utilities for frontend security

// XSS prevention - escape HTML
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Kenya format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+254|0)?[7]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate price (positive number)
export const isValidPrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

// Validate file size
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Validate file type
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Prevent SQL injection (basic)
export const sanitizeForDatabase = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .trim();
};

// Validate and sanitize form data
export const validateFormData = (data, schema) => {
  const errors = {};
  const sanitized = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Check required fields
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[key] = `${rules.label || key} is required`;
      continue;
    }

    if (value) {
      // Sanitize string inputs
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }

      // Validate email
      if (rules.type === 'email' && !isValidEmail(value)) {
        errors[key] = `${rules.label || key} must be a valid email`;
      }

      // Validate phone
      if (rules.type === 'phone' && !isValidPhone(value)) {
        errors[key] = `${rules.label || key} must be a valid phone number`;
      }

      // Validate min length
      if (rules.minLength && value.toString().length < rules.minLength) {
        errors[key] = `${rules.label || key} must be at least ${rules.minLength} characters`;
      }

      // Validate max length
      if (rules.maxLength && value.toString().length > rules.maxLength) {
        errors[key] = `${rules.label || key} must not exceed ${rules.maxLength} characters`;
      }

      // Validate min value
      if (rules.min !== undefined && parseFloat(value) < rules.min) {
        errors[key] = `${rules.label || key} must be at least ${rules.min}`;
      }

      // Validate max value
      if (rules.max !== undefined && parseFloat(value) > rules.max) {
        errors[key] = `${rules.label || key} must not exceed ${rules.max}`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

// Detect and prevent XSS in user-generated content
export const detectXSS = (input) => {
  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<img.*onerror/i,
    /<svg.*onload/i
  ];

  if (typeof input !== 'string') return false;
  return xssPatterns.some(pattern => pattern.test(input));
};

// Safe HTML rendering — always escape to prevent XSS
export const safeHtml = (html) => {
  return escapeHtml(html);
};

export default {
  escapeHtml,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidPrice,
  isValidFileSize,
  isValidFileType,
  sanitizeForDatabase,
  validateFormData,
  detectXSS,
  safeHtml
};
