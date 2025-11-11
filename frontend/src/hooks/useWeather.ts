import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, CloudDrizzle, CloudLightning, Eye } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

// OpenWeatherMap API - Free tier
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user's location
        const location = await getCurrentLocation();
        
        if (!location) {
          throw new Error("Location not available");
        }

        // Fetch weather data
        const weatherData = await fetchWeatherData(location.latitude, location.longitude);
        setWeather(weatherData);
      } catch (err: any) {
        console.error("Weather fetch error:", err);
        const errorMessage = err.message || "Unable to fetch weather";
        setError(errorMessage);
        
        // Don't show weather widget if there's any error - set weather to null
        setWeather(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, isLoading, error };
};

const getCurrentLocation = (): Promise<LocationData | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // Provide specific error messages
        let errorMessage = "Location not available";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        timeout: 15000,
        maximumAge: 300000, // Cache for 5 minutes
        enableHighAccuracy: true, // Request better accuracy for weather relevance
      }
    );
  });
};

const fetchWeatherData = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  if (!WEATHER_API_KEY) {
    throw new Error("Weather API key not configured");
  }

  const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    temperature: Math.round(data.main.temp),
    condition: mapWeatherCondition(data.weather[0].main, data.weather[0].icon),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
  };
};

const mapWeatherCondition = (main: string, icon: string): string => {
  const iconCode = icon.substring(0, 2);
  
  // Map OpenWeatherMap conditions to our condition types
  switch (main.toLowerCase()) {
    case "clear":
      return "sunny";
    case "clouds":
      return iconCode === "02" ? "partly-cloudy" : "cloudy";
    case "rain":
    case "drizzle":
      return "rainy";
    case "thunderstorm":
      return "stormy";
    case "snow":
      return "snowy";
    case "mist":
    case "fog":
    case "haze":
      return "foggy";
    default:
      return "cloudy";
  }
};

export const getWeatherIcon = (condition: string, icon?: string) => {
  // Use icon code if available for more accurate representation
  if (icon) {
    const iconCode = icon.substring(0, 2);
    const isDay = icon.includes("d");
    
    switch (iconCode) {
      case "01": // Clear sky
        return Sun;
      case "02": // Few clouds
        return Cloud;
      case "03": // Scattered clouds
      case "04": // Broken clouds
        return Cloud;
      case "09": // Shower rain
        return CloudDrizzle;
      case "10": // Rain
        return CloudRain;
      case "11": // Thunderstorm
        return CloudLightning;
      case "13": // Snow
        return CloudSnow;
      case "50": // Mist
        return Eye;
      default:
        return Cloud;
    }
  }

  // Fallback to condition-based icons
  switch (condition.toLowerCase()) {
    case "sunny":
    case "clear":
      return Sun;
    case "rainy":
    case "rain":
      return CloudRain;
    case "stormy":
    case "thunderstorm":
      return CloudLightning;
    case "snowy":
    case "snow":
      return CloudSnow;
    case "foggy":
    case "mist":
    case "fog":
      return Eye;
    case "windy":
      return Wind;
    case "partly-cloudy":
      return Cloud;
    case "cloudy":
    default:
      return Cloud;
  }
};

export const getWeatherIconColor = (condition: string, icon?: string): string => {
  if (icon) {
    const iconCode = icon.substring(0, 2);
    switch (iconCode) {
      case "01": // Clear sky
        return "text-yellow-400";
      case "02": // Few clouds
        return "text-blue-300";
      case "09": // Shower rain
      case "10": // Rain
        return "text-blue-400";
      case "11": // Thunderstorm
        return "text-purple-400";
      case "13": // Snow
        return "text-blue-200";
      case "50": // Mist
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  }

  switch (condition.toLowerCase()) {
    case "sunny":
      return "text-yellow-400";
    case "rainy":
      return "text-blue-400";
    case "stormy":
      return "text-purple-400";
    case "snowy":
      return "text-blue-200";
    case "foggy":
      return "text-gray-400";
    default:
      return "text-gray-300";
  }
};

