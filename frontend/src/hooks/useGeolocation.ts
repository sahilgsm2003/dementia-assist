import { useState, useCallback } from 'react';

interface LocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

interface UseGeolocationOptions {
  targetAccuracy?: number; // Stop if accuracy is better than this (meters)
  maxWaitTime?: number; // How long to wait for better accuracy (ms)
  minAcceptableAccuracy?: number; // Minimum accuracy to consider "successful" if timing out (meters)
  onProgress?: (accuracy: number) => void;
}

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async (options: UseGeolocationOptions = {}): Promise<LocationResult> => {
    const {
      targetAccuracy = 50, // Target 50 meters
      maxWaitTime = 15000, // Wait max 15 seconds (reduced from 60s)
      minAcceptableAccuracy = 5000, // Accept up to 5km if we can't get better
      onProgress
    } = options;

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const err = "Geolocation is not supported by your browser";
        setError(err);
        setIsLoading(false);
        reject(new Error(err));
        return;
      }

      let watchId: number | null = null;
      let bestPosition: GeolocationPosition | null = null;
      let timerId: NodeJS.Timeout;

      const cleanup = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (timerId) clearTimeout(timerId);
        setIsLoading(false);
      };

      const finish = (position: GeolocationPosition) => {
        cleanup();
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      };

      // Timeout handler
      timerId = setTimeout(() => {
        if (bestPosition) {
          // Check if the best position we found is acceptable
          if (bestPosition.coords.accuracy <= minAcceptableAccuracy) {
             finish(bestPosition);
          } else {
             // We have a position but it's very inaccurate
             cleanup();
             const err = `Location accuracy is poor (±${Math.round(bestPosition.coords.accuracy)}m). Please enable precise location in your system settings or move outdoors.`;
             setError(err);
             reject(new Error(err));
          }
        } else {
          cleanup();
          const err = "Could not get location. Please ensure GPS is enabled and your browser has location permissions.";
          setError(err);
          reject(new Error(err));
        }
      }, maxWaitTime);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          
          if (onProgress) {
            onProgress(accuracy);
          }

          // Update best position logic
          if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }

          // If accuracy is good enough, stop immediately
          if (accuracy <= targetAccuracy) {
            finish(position);
          }
        },
        (err) => {
          // If we get an error but have a best position, we might still return it on timeout
          // But if it's a permission error, we should fail immediately
          if (err.code === err.PERMISSION_DENIED) {
            cleanup();
            const errorMsg = "Location permission denied. Please enable location access.";
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
          // For other errors (TIMEOUT, POSITION_UNAVAILABLE), we keep waiting until our main timeout 
          // unless we strictly have no hope. But watchPosition might retry.
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // Accept positions up to 10 seconds old to get faster initial fix
          timeout: 20000 // Increased internal timeout to avoid premature timeouts
        }
      );
    });
  }, []);

  return { getCurrentLocation, isLoading, error };
};

