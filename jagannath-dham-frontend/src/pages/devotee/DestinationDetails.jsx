
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    MapPinned,
    ExternalLink,
    CalendarDays,
    Droplets,
    Wind,
    CloudSun
} from "lucide-react";

import api from "../../services/api";
import "./DestinationDetails.css";

function DestinationDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [destination, setDestination] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDestination = async () => {
            try {
                setLoading(true);
                setError("");
                setDestination(null);
                setWeather(null);

                const response = await api.get(
                    `/destinations/slug/${slug}`
                );

                const data = response.data;
                setDestination(data);

                try {
                    const weatherResponse = await api.get(
                        `/weather/destination/${data.id}`
                    );
                    setWeather(weatherResponse.data);
                } catch (weatherError) {
                    console.error("Weather fetch error:", weatherError);
                } finally {
                    setWeatherLoading(false);
                }
            } catch (err) {
                console.error("Destination fetch error:", err);
                setError("Unable to load this destination.");
            } finally {
                setLoading(false);
            }
        };

        setWeatherLoading(true);
        fetchDestination();
    }, [slug]);

    if (loading) {
        return (
            <div className="destination-details-state">
                <p>Loading destination details...</p>
            </div>
        );
    }

    if (error || !destination) {
        return (
            <div className="destination-details-state">
                <h2>Destination not found</h2>
                <p>{error || "This destination is unavailable."}</p>
                <button onClick={() => navigate("/devotee/destinations")}>
                    <ArrowLeft size={17} />
                    Back to Explore Odisha
                </button>
            </div>
        );
    }

    const mapLocation = `${destination.district}, Odisha`;

    const googleMapsEmbedUrl =
        `https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&output=embed`;

    const googleMapsUrl =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`;

    return (
        <div className="destination-details-page">

            <button
                className="destination-back-btn"
                onClick={() => navigate("/devotee/destinations")}
            >
                <ArrowLeft size={18} />
                Back to Explore Odisha
            </button>

            {/* Destination Hero */}
            <div className="destination-hero">
                {destination.imageUrl ? (
                    <img
                        src={destination.imageUrl}
                        alt={destination.name}
                    />
                ) : (
                    <div className="destination-hero-placeholder">
                        <MapPin size={48} />
                    </div>
                )}

                <div className="destination-hero-overlay">
                    <span>EXPLORE ODISHA</span>
                    <h1>{destination.name}</h1>
                    <p>
                        <MapPin size={17} />
                        {destination.district}, Odisha
                    </p>
                </div>
            </div>

            {/* Destination Information and Weather */}
            <div className="destination-details-grid">

                <main className="destination-description">
                    <span className="destination-section-label">
                        ABOUT THIS PLACE
                    </span>

                    <h2>Discover {destination.name}</h2>

                    <p>
                        {destination.fullDescription ||
                            destination.shortDescription}
                    </p>

                    {destination.famousFor && (
                        <div className="destination-info-block">
                            <h3>Famous For</h3>
                            <p>{destination.famousFor}</p>
                        </div>
                    )}

                    {destination.bestSeason && (
                        <div className="destination-info-block">
                            <h3>
                                <CalendarDays size={19} />
                                Best Season to Visit
                            </h3>
                            <p>{destination.bestSeason}</p>
                        </div>
                    )}
                </main>

                {/* Weather Card */}
                <aside className="destination-weather-card">

                    <div className="destination-weather-heading">
                        <div>
                            <span>LIVE WEATHER</span>
                            <h2>Weather Information</h2>
                        </div>
                        <CloudSun size={30} />
                    </div>

                    {weatherLoading ? (
                        <p className="weather-message">
                            Loading weather...
                        </p>
                    ) : weather ? (
                        <>
                            <div className="weather-temperature">
                                <strong>
                                    {Math.round(weather.temperature)}°C
                                </strong>
                                <span>{weather.weatherCondition}</span>
                            </div>

                            <p className="weather-description">
                                {weather.weatherDescription}
                            </p>

                            <div className="weather-feels-like">
                                Feels like {Math.round(weather.feelsLike)}°C
                            </div>

                            <div className="weather-extra">

                                <div>
                                    <Droplets size={20} />
                                    <span>Humidity</span>
                                    <strong>{weather.humidity}%</strong>
                                </div>

                                <div>
                                    <Wind size={20} />
                                    <span>Wind Speed</span>
                                    <strong>{weather.windSpeed} m/s</strong>
                                </div>

                            </div>
                        </>
                    ) : (
                        <p className="weather-message">
                            Weather information is currently unavailable.
                        </p>
                    )}

                </aside>
            </div>

            {/* Destination Location Map */}
            <div className="destination-map-card">

                <div className="destination-map-heading">

                    <div>
                        <span className="destination-section-label">
                            EXPLORE THE AREA
                        </span>

                        <h2>
                            <MapPinned size={21} />
                            Location Map
                        </h2>

                        <p>{mapLocation}</p>
                    </div>

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open in Google Maps
                        <ExternalLink size={16} />
                    </a>

                </div>

                <iframe
                    title={`Map of ${mapLocation}`}
                    src={googleMapsEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                />

            </div>

        </div>
    );
}

export default DestinationDetails;
