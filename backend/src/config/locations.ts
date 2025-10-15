/**
 * Hospital Location Configuration
 * Maps city names to location codes for patient ID generation
 */

export const HOSPITAL_LOCATIONS = {
  CHENNAI: {
    code: 'CHN',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India'
  },
  MUMBAI: {
    code: 'MUM',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  },
  DELHI: {
    code: 'DEL',
    name: 'Delhi',
    state: 'Delhi',
    country: 'India'
  },
  BANGALORE: {
    code: 'BLR',
    name: 'Bangalore',
    state: 'Karnataka',
    country: 'India'
  },
  HYDERABAD: {
    code: 'HYD',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India'
  },
  KOLKATA: {
    code: 'KOL',
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India'
  },
  PUNE: {
    code: 'PUN',
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India'
  }
} as const;

export type LocationCode = keyof typeof HOSPITAL_LOCATIONS;

/**
 * Get location code from city name
 * @param cityName - City name (e.g., "Chennai", "Mumbai")
 * @returns Location code (e.g., "CHN", "MUM")
 */
export function getLocationCode(cityName: string): string {
  const normalizedCity = cityName.trim().toUpperCase();
  
  // Direct match
  if (normalizedCity in HOSPITAL_LOCATIONS) {
    return HOSPITAL_LOCATIONS[normalizedCity as LocationCode].code;
  }
  
  // Fuzzy match
  const location = Object.values(HOSPITAL_LOCATIONS).find(
    loc => loc.name.toUpperCase() === normalizedCity
  );
  
  return location?.code || 'CHN'; // Default to Chennai
}

/**
 * Get location name from code
 * @param code - Location code (e.g., "CHN", "MUM")
 * @returns City name (e.g., "Chennai", "Mumbai")
 */
export function getLocationName(code: string): string {
  const location = Object.values(HOSPITAL_LOCATIONS).find(
    loc => loc.code === code
  );
  return location?.name || 'Chennai';
}

/**
 * Validate if location exists
 * @param cityName - City name to validate
 * @returns true if location exists
 */
export function isValidLocation(cityName: string): boolean {
  const normalizedCity = cityName.trim().toUpperCase();
  return normalizedCity in HOSPITAL_LOCATIONS || 
         Object.values(HOSPITAL_LOCATIONS).some(
           loc => loc.name.toUpperCase() === normalizedCity
         );
}
