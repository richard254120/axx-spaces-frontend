import { describe, it, expect } from 'vitest';
import {
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
  safeHtml,
} from './validation';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it('returns non-string values unchanged', () => {
    expect(escapeHtml(123)).toBe(123);
    expect(escapeHtml(null)).toBe(null);
    expect(escapeHtml(undefined)).toBe(undefined);
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('removes angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(null)).toBe(null);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.ke')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid Kenyan phone numbers', () => {
    expect(isValidPhone('0712345678')).toBe(true);
    expect(isValidPhone('+254712345678')).toBe(true);
    expect(isValidPhone('0798765432')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('0812345678')).toBe(false);
    expect(isValidPhone('+1234567890')).toBe(false);
  });

  it('handles whitespace in phone numbers', () => {
    expect(isValidPhone('07 1234 5678')).toBe(true);
  });
});

describe('isValidUrl', () => {
  it('accepts valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('ftp://files.example.com/resource')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('example')).toBe(false);
  });
});

describe('isValidPrice', () => {
  it('accepts positive numbers', () => {
    expect(isValidPrice(100)).toBe(true);
    expect(isValidPrice('99.99')).toBe(true);
    expect(isValidPrice('0.01')).toBe(true);
  });

  it('rejects zero and negative numbers', () => {
    expect(isValidPrice(0)).toBe(false);
    expect(isValidPrice(-10)).toBe(false);
  });

  it('rejects non-numeric values', () => {
    expect(isValidPrice('abc')).toBe(false);
    expect(isValidPrice('')).toBe(false);
  });
});

describe('isValidFileSize', () => {
  it('accepts files within size limit', () => {
    const file = { size: 1024 * 1024 }; // 1MB
    expect(isValidFileSize(file, 5)).toBe(true);
  });

  it('rejects files exceeding size limit', () => {
    const file = { size: 10 * 1024 * 1024 }; // 10MB
    expect(isValidFileSize(file, 5)).toBe(false);
  });

  it('accepts files exactly at the limit', () => {
    const file = { size: 5 * 1024 * 1024 }; // 5MB
    expect(isValidFileSize(file, 5)).toBe(true);
  });
});

describe('isValidFileType', () => {
  it('accepts allowed file types', () => {
    const file = { type: 'image/jpeg' };
    expect(isValidFileType(file, ['image/jpeg', 'image/png'])).toBe(true);
  });

  it('rejects disallowed file types', () => {
    const file = { type: 'application/pdf' };
    expect(isValidFileType(file, ['image/jpeg', 'image/png'])).toBe(false);
  });
});

describe('sanitizeForDatabase', () => {
  it('removes SQL special characters', () => {
    expect(sanitizeForDatabase("user'; DROP TABLE--")).toBe('user DROP TABLE--');
  });

  it('trims whitespace', () => {
    expect(sanitizeForDatabase('  clean  ')).toBe('clean');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitizeForDatabase(42)).toBe(42);
  });
});

describe('validateFormData', () => {
  it('returns valid when all required fields are provided', () => {
    const data = { name: 'John', email: 'john@example.com' };
    const schema = {
      name: { required: true, label: 'Name' },
      email: { required: true, type: 'email', label: 'Email' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns error for missing required fields', () => {
    const data = { name: '' };
    const schema = {
      name: { required: true, label: 'Name' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name is required');
  });

  it('validates email type', () => {
    const data = { email: 'not-an-email' };
    const schema = {
      email: { required: true, type: 'email', label: 'Email' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Email must be a valid email');
  });

  it('validates phone type', () => {
    const data = { phone: '123' };
    const schema = {
      phone: { required: true, type: 'phone', label: 'Phone' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.phone).toBe('Phone must be a valid phone number');
  });

  it('validates minLength', () => {
    const data = { password: 'ab' };
    const schema = {
      password: { required: true, minLength: 6, label: 'Password' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe('Password must be at least 6 characters');
  });

  it('validates maxLength', () => {
    const data = { name: 'a'.repeat(60) };
    const schema = {
      name: { required: true, maxLength: 50, label: 'Name' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Name must not exceed 50 characters');
  });

  it('validates min value', () => {
    const data = { price: '0' };
    const schema = {
      price: { required: true, min: 1, label: 'Price' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.price).toBe('Price must be at least 1');
  });

  it('validates max value', () => {
    const data = { quantity: '1000' };
    const schema = {
      quantity: { required: true, max: 100, label: 'Quantity' },
    };
    const result = validateFormData(data, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.quantity).toBe('Quantity must not exceed 100');
  });

  it('sanitizes string inputs', () => {
    const data = { name: '  <John>  ' };
    const schema = {
      name: { required: true, label: 'Name' },
    };
    const result = validateFormData(data, schema);
    expect(result.sanitized.name).toBe('John');
  });
});

describe('detectXSS', () => {
  it('detects script tags', () => {
    expect(detectXSS('<script>alert("xss")</script>')).toBe(true);
  });

  it('detects iframe tags', () => {
    expect(detectXSS('<iframe src="evil.com">')).toBe(true);
  });

  it('detects javascript: protocol', () => {
    expect(detectXSS('javascript:alert(1)')).toBe(true);
  });

  it('detects event handlers', () => {
    expect(detectXSS('<div onmouseover=alert(1)>')).toBe(true);
    expect(detectXSS('<img onerror=alert(1)>')).toBe(true);
  });

  it('detects svg onload', () => {
    expect(detectXSS('<svg onload=alert(1)>')).toBe(true);
  });

  it('returns false for safe content', () => {
    expect(detectXSS('Hello World')).toBe(false);
    expect(detectXSS('This is a normal sentence.')).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(detectXSS(123)).toBe(false);
    expect(detectXSS(null)).toBe(false);
  });
});

describe('safeHtml', () => {
  it('returns safe HTML unchanged', () => {
    expect(safeHtml('<p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('escapes dangerous HTML', () => {
    const dangerous = '<script>alert("xss")</script>';
    const result = safeHtml(dangerous);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
});
