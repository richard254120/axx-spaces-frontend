import { useState, useEffect } from "react";

/**
 * PhoneInput component that automatically adds Kenya country code (+254)
 * Ensures WhatsApp integration works correctly
 */
export default function PhoneInput({ value, onChange, placeholder = "+254 7XX XXX XXX", style, ...props }) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Initialize with existing value or +254
    if (value) {
      setDisplayValue(value);
    } else {
      setDisplayValue("+254");
    }
  }, [value]);

  const handleChange = (e) => {
    let inputValue = e.target.value;

    // Remove all non-digit characters except +
    let cleaned = inputValue.replace(/[^\d+]/g, "");

    // Ensure it starts with +254
    if (!cleaned.startsWith("+254")) {
      if (cleaned.startsWith("254")) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("0")) {
        // Convert 07... to +2547...
        cleaned = "+254" + cleaned.substring(1);
      } else if (cleaned.startsWith("7")) {
        // Convert 7... to +2547...
        cleaned = "+254" + cleaned;
      } else if (!cleaned.startsWith("+")) {
        cleaned = "+254" + cleaned;
      }
    }

    // Limit to +254 followed by 9 digits (standard Kenyan format)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }

    setDisplayValue(cleaned);
    onChange(cleaned);
  };

  const handleFocus = (e) => {
    // Select all text on focus for easy editing
    e.target.select();
  };

  return (
    <input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
}
