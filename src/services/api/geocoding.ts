import client from './client';

// Types
interface GeocodeResult {
    id: string;
    name: string;
    address: string;
    display_name: string;
    lat: number;
    lng: number;
    place_id?: string;
}

interface ReverseGeocodeResult {
    address: string;
    display_name: string;
    lat?: number;
    lng?: number;
    place_id?: string;
}

interface RouteResult {
    success: boolean;
    coordinates: [number, number][];
    distance: number;
    duration: number;
    distanceKm: string;
    durationMinutes: number;
    steps?: any[];
    summary?: any;
    provider?: string;
}

export const geocodingService = {
    /**
     * Geocode - search location by text
     * GET /bookings/geocode
     */
    geocode: async (query: string): Promise<GeocodeResult[]> => {
        try {
            const cleanQuery = query.trim();
            if (!cleanQuery || cleanQuery.length < 2) return [];

            const response = await client.get('/bookings/geocode', {
                params: { q: cleanQuery },
            });

            const data = response.data;
            console.log('Geocode API response:', data);

            // Handle the OLA API response format
            if (data.success && data.results && Array.isArray(data.results)) {
                return data.results.map((result: any, index: number) => {
                    let address = result.display_name || '';
                    let name = '';

                    if (result.address && Array.isArray(result.address)) {
                        const locality = result.address.find((addr: any) =>
                            addr.types && addr.types.includes('locality')
                        );
                        const adminArea = result.address.find((addr: any) =>
                            addr.types && addr.types.includes('administrative_area_level_1')
                        );

                        if (locality) {
                            name = locality.long_name || locality.short_name;
                        } else if (adminArea) {
                            name = adminArea.long_name || adminArea.short_name;
                        }

                        const street = result.address.find((addr: any) =>
                            addr.types && addr.types.includes('street_address')
                        );
                        const postalCode = result.address.find((addr: any) =>
                            addr.types && addr.types.includes('postal_code')
                        );

                        if (street) {
                            address = `${street.long_name || street.short_name}, ${address}`;
                        }
                        if (postalCode) {
                            address = `${address} - ${postalCode.long_name || postalCode.short_name}`;
                        }
                    }

                    return {
                        id: result.place_id || `place_${Date.now()}_${index}`,
                        name: name || result.display_name?.split(',')[0] || 'Location',
                        address: address,
                        display_name: result.display_name,
                        lat: result.lat,
                        lng: result.lng,
                        place_id: result.place_id,
                    };
                });
            }

            if (Array.isArray(data)) {
                return data.slice(0, 10);
            } else if (data.features && Array.isArray(data.features)) {
                return data.features.slice(0, 10);
            }

            console.log('Unknown geocode response format:', data);
            return [];

        } catch (error) {
            console.log('Geocode error (non-critical):', error);
            return [];
        }
    },

    /**
     * Reverse geocode - get address from coordinates
     * GET /bookings/reverse-geocode
     */
    reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
        try {
            const response = await client.get('/bookings/reverse-geocode', {
                params: { lat, lng },
            });

            const data = response.data;
            console.log('Reverse geocode API response:', data);

            // Handle success response with results array
            if (data.success && data.results && Array.isArray(data.results) && data.results.length > 0) {
                const result = data.results[0];
                return {
                    address: result.display_name || 'Your current location',
                    display_name: result.display_name,
                    lat: result.lat,
                    lng: result.lng,
                    place_id: result.place_id,
                };
            }

            // Handle direct address in response
            if (data.address && data.address !== `${lat}, ${lng}`) {
                return {
                    address: data.address,
                    display_name: data.address,
                    lat,
                    lng,
                };
            }

            if (data.place_name) {
                return { address: data.place_name, display_name: data.place_name };
            } else if (data.features && data.features.length > 0) {
                return {
                    address: data.features[0].place_name,
                    display_name: data.features[0].place_name,
                };
            }

            // Fallback to a nicely formatted location
            return {
                address: 'Your current location',
                display_name: 'Your current location',
                lat,
                lng,
            };

        } catch (error: any) {
            // Check if it's a 404 with a message (no address found)
            if (error?.response?.status === 404 && error?.response?.data?.address) {
                // Backend returned coordinates as address - return a friendly fallback
                console.log('Reverse geocode: No address found, using fallback');
                return {
                    address: 'Your current location',
                    display_name: 'Your current location',
                    lat,
                    lng,
                };
            }

            console.log('Reverse geocode error (non-critical):', error?.message || error);
            return {
                address: 'Your current location',
                display_name: 'Your current location',
                lat,
                lng,
            };
        }
    },

    /**
     * Get route between two points
     * POST /bookings/route
     */
    getRoute: async (
        pickupCoords: { lat: number; lng: number },
        dropoffCoords: { lat: number; lng: number }
    ): Promise<RouteResult> => {
        try {
            console.log('Getting route from backend...');

            const response = await client.post('/bookings/route', {
                pickup: {
                    coords: {
                        lat: parseFloat(String(pickupCoords.lat)),
                        lng: parseFloat(String(pickupCoords.lng)),
                    },
                },
                dropoff: {
                    coords: {
                        lat: parseFloat(String(dropoffCoords.lat)),
                        lng: parseFloat(String(dropoffCoords.lng)),
                    },
                },
                options: { mode: 'drive' },
            });

            const data = response.data;
            console.log('Backend Route Response:', data);

            if (data.success && data.coordinates && Array.isArray(data.coordinates)) {
                const formattedCoordinates = data.coordinates.map((coord: any) => {
                    if (Array.isArray(coord) && coord.length === 2) {
                        return [coord[0], coord[1]];
                    }
                    return coord;
                });

                return {
                    success: true,
                    coordinates: formattedCoordinates,
                    distance: data.distance || 0,
                    duration: data.duration || 0,
                    distanceKm: data.distance ? (data.distance / 1000).toFixed(2) : '0',
                    durationMinutes: data.duration ? Math.round(data.duration / 60) : 0,
                    steps: data.steps || [],
                    summary: data.summary || {},
                    provider: data.provider || 'ola',
                };
            } else if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    success: true,
                    coordinates: route.geometry?.coordinates || [],
                    distance: route.distance || 0,
                    duration: route.duration || 0,
                    distanceKm: route.distance ? (route.distance / 1000).toFixed(2) : '0',
                    durationMinutes: route.duration ? Math.round(route.duration / 60) : 0,
                    steps: route.legs?.[0]?.steps || [],
                    provider: 'mapbox',
                    summary: {},
                };
            }

            console.error('Invalid route response format:', data);
            throw new Error('Invalid route response format from backend');

        } catch (error) {
            console.error('Get route error:', error);
            throw error;
        }
    },
};
