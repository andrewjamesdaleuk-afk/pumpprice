export const detectCountry = (postcode: string): 'GB' | 'FR' | 'Unknown' => {
  if (postcode === 'Current location') return 'GB'; // Default to GB for now if using geolocation
  const cleanPostcode = postcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // French: Exactly 5 digits
  if (/^[0-9]{5}$/.test(cleanPostcode)) {
    return 'FR';
  }
  
  // UK Pattern (SW1A 1AA or KT22 0EF)
  if (/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(cleanPostcode)) {
    return 'GB';
  }
  
  // Partial UK
  if (/^[A-Z]{1,2}[0-9][A-Z0-9]?$/.test(cleanPostcode)) {
    return 'GB';
  }

  return 'Unknown';
};
