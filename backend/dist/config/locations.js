"use strict";
/**
 * Hospital Location Configuration
 * Maps city names to location codes for patient ID generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidLocation = exports.getLocationName = exports.getLocationCode = exports.HOSPITAL_LOCATIONS = void 0;
exports.HOSPITAL_LOCATIONS = {
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
};
/**
 * Get location code from city name
 * @param cityName - City name (e.g., "Chennai", "Mumbai")
 * @returns Location code (e.g., "CHN", "MUM")
 */
function getLocationCode(cityName) {
    const normalizedCity = cityName.trim().toUpperCase();
    // Direct match
    if (normalizedCity in exports.HOSPITAL_LOCATIONS) {
        return exports.HOSPITAL_LOCATIONS[normalizedCity].code;
    }
    // Fuzzy match
    const location = Object.values(exports.HOSPITAL_LOCATIONS).find(loc => loc.name.toUpperCase() === normalizedCity);
    return (location === null || location === void 0 ? void 0 : location.code) || 'CHN'; // Default to Chennai
}
exports.getLocationCode = getLocationCode;
/**
 * Get location name from code
 * @param code - Location code (e.g., "CHN", "MUM")
 * @returns City name (e.g., "Chennai", "Mumbai")
 */
function getLocationName(code) {
    const location = Object.values(exports.HOSPITAL_LOCATIONS).find(loc => loc.code === code);
    return (location === null || location === void 0 ? void 0 : location.name) || 'Chennai';
}
exports.getLocationName = getLocationName;
/**
 * Validate if location exists
 * @param cityName - City name to validate
 * @returns true if location exists
 */
function isValidLocation(cityName) {
    const normalizedCity = cityName.trim().toUpperCase();
    return normalizedCity in exports.HOSPITAL_LOCATIONS ||
        Object.values(exports.HOSPITAL_LOCATIONS).some(loc => loc.name.toUpperCase() === normalizedCity);
}
exports.isValidLocation = isValidLocation;
