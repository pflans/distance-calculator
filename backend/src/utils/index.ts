import fetch from 'node-fetch';

interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitized?: string;
}

interface Coordinates {
    lat: number;
    lon: number;
}

interface NominatimResponse {
    lat: string;
    lon: string;
}

const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 5000, // 5 seconds
};

export function validateAddress(address: unknown): ValidationResult {
    if (typeof address !== 'string') {
        return { isValid: false, error: 'Address must be a string' };
    }

    const decodedAddress = decodeURIComponent(address);

    if (!decodedAddress.trim()) {
        return { isValid: false, error: 'Address cannot be empty' };
    }

    if (decodedAddress.length > 500) {
        return { isValid: false, error: 'Address is too long (max 500 characters)' };
    }

    // Check for potentially dangerous characters
    const dangerousPattern = /[<>{}[\]\\]/;
    if (dangerousPattern.test(decodedAddress)) {
        return { isValid: false, error: 'Address contains invalid characters' };
    }

    // Check for SQL injection attempts
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(['"])/i;
    if (sqlInjectionPattern.test(decodedAddress)) {
        return { isValid: false, error: 'Invalid address format' };
    }

    return { isValid: true, sanitized: decodedAddress.trim() };
}

export function sanitizeCoordinates(coords: unknown): Coordinates | null {
    if (!coords || typeof coords !== 'object') return null;
    
    const coordObj = coords as { lat?: string | number; lon?: string | number };
    const lat = parseFloat(coordObj.lat?.toString() || '');
    const lon = parseFloat(coordObj.lon?.toString() || '');

    if (isNaN(lat) || isNaN(lon)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lon < -180 || lon > 180) return null;

    return { lat, lon };
}

export function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export async function retryOperation<T>(operation: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retryCount >= RETRY_CONFIG.maxRetries) {
            throw error;
        }

        const delay = Math.min(
            RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
            RETRY_CONFIG.maxDelay
        );

        console.log(`Retry attempt ${retryCount + 1} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryOperation(operation, retryCount + 1);
    }
}

export async function geocodeAddress(address: string): Promise<Coordinates> {
    try {
        const validation = validateAddress(address);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }

        const geocodeOperation = async () => {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(validation.sanitized || '')}&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'DistanceCalculator/1.0'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to geocode address: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as NominatimResponse[];
            if (!data || data.length === 0) {
                throw new Error('Address not found');
            }

            const coords = sanitizeCoordinates({
                lat: data[0].lat,
                lon: data[0].lon
            });

            if (!coords) {
                throw new Error('Invalid coordinates received from geocoding service');
            }

            return coords;
        };

        return await retryOperation(geocodeOperation);
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
}

export async function calculateDistances(sourceAddress: string, destinationAddress: string): Promise<{ miles: number; kilometers: number }> {
    try {
        const [sourceCoords, destCoords] = await Promise.all([
            geocodeAddress(sourceAddress),
            geocodeAddress(destinationAddress)
        ]);

        if (!sourceCoords || !destCoords) {
            throw new Error('Could not find coordinates for one or both addresses');
        }

        const distanceKm = haversineDistance(
            sourceCoords.lat,
            sourceCoords.lon,
            destCoords.lat,
            destCoords.lon
        );

        const distanceMiles = distanceKm * 0.621371;

        return {
            miles: distanceMiles,
            kilometers: distanceKm
        };
    } catch (error) {
        console.error('Error calculating distances:', error);
        throw error;
    }
} 