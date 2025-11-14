// src/utils/format.js

// Convert cents to readable money format
export function formatCents(cents) {
  return (cents / 100).toFixed(2);
}
