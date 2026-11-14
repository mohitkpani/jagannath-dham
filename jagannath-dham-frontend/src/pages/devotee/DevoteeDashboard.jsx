
import { useEffect, useState } from "react";

import {
    CalendarDays,
    Ticket,
    QrCode,
    MapPin,
    UserCircle,
    ArrowRight,
    CloudSun
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import jagannathBanner from "../../assets/jagannath-banner.png";
import "./DevoteeDashboard.css";
import NotificationBell from "../../components/NotificationBell";
import FloatingChatAssistant from "../../components/FloatingChatAssistant";

function DevoteeDashboard() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState(
        localStorage.getItem("userName") || "Devotee"
    );

    const [destinations, setDestinations] = useState([]);
    const [destinationsLoading, setDestinationsLoading] = useState(true);

    const [festivals, setFestivals] = useState([]);
    const [festivalsLoading, setFestivalsLoading] = useState(true);

    const [profileImage, setProfileImage] = useState("");

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState("");

    const [nextDarshan, setNextDarshan] = useState(null);
    const [nextDarshanLoading, setNextDarshanLoading] = useState(true);

    // Fetch Profile and Destinations
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [profileResponse, destinationsResponse] =
                    await Promise.all([
                        api.get("/users/profile"),
                        api.get("/destinations/published")
                    ]);

                const profile = profileResponse.data;

                if (profile.fullName) {
                    setUserName(profile.fullName);
                    localStorage.setItem("userName", profile.fullName);
                }

                setProfileImage(profile.profileImageUrl || "");

                setDestinations(
                    Array.isArray(destinationsResponse.data)
                        ? destinationsResponse.data.slice(0, 4)
                        : []
                );

            } catch (error) {
                console.error("Dashboard data error:", error);
            } finally {
                setDestinationsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch Festivals
    useEffect(() => {
        const fetchFestivals = async () => {
            try {
                const response = await api.get("/festivals");

                setFestivals(
                    Array.isArray(response.data)
                        ? response.data.slice(0, 4)
                        : []
                );

            } catch (error) {
                console.error("Failed to fetch festivals:", error);
            } finally {
                setFestivalsLoading(false);
            }
        };

        fetchFestivals();
    }, []);

    // Fetch Puri Weather
    useEffect(() => {
        const fetchPuriWeather = async () => {
            try {
                setWeatherLoading(true);
                setWeatherError("");

                const response = await api.get("/weather/puri");
                setWeather(response.data);

            } catch (error) {
                console.error("Failed to fetch Puri weather:", error);
                setWeatherError("Unable to load weather");

            } finally {
                setWeatherLoading(false);
            }
        };

        fetchPuriWeather();
    }, []);

    // Fetch Next Confirmed Darshan
    useEffect(() => {
        const fetchNextDarshan = async () => {
            try {
                setNextDarshanLoading(true);

                const response = await api.get("/bookings/my");

                const bookings = Array.isArray(response.data)
                    ? response.data
                    : [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Only confirmed, paid, unused upcoming bookings
                const upcomingBookings = bookings
                    .filter((booking) => {
                        const slotDate =
                            booking.darshanDate ||
                            booking.darshanSlot?.slotDate;

                        if (!slotDate) {
                            return false;
                        }

                        const bookingDate = new Date(
                            `${slotDate}T00:00:00`
                        );

                        return (
                            booking.bookingStatus === "CONFIRMED" &&
                            booking.paymentStatus === "SUCCESS" &&
                            booking.ticketUsed !== true &&
                            !Number.isNaN(bookingDate.getTime()) &&
                            bookingDate >= today
                        );
                    })
                    // Show the nearest upcoming Darshan first
                    .sort((a, b) => {
                        const dateA =
                            a.darshanDate || a.darshanSlot?.slotDate;

                        const dateB =
                            b.darshanDate || b.darshanSlot?.slotDate;

                        return dateA.localeCompare(dateB);
                    });

                setNextDarshan(upcomingBookings[0] || null);

            } catch (error) {
                console.error("Failed to fetch next Darshan:", error);
                setNextDarshan(null);

            } finally {
                setNextDarshanLoading(false);
            }
        };

        fetchNextDarshan();
    }, []);

    // Date Formatter
    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    };

    return (
        <div className="devotee-dashboard">

            {/* Welcome Header */}
            <header className="welcome-header">
                <div>
                    <h1>Welcome, {userName} 👋</h1>
                    <p>
                        Plan your Darshan and explore the spiritual beauty of Odisha.
                    </p>
                </div>

                <div className="header-actions">
                    <NotificationBell />

                    <button
                        aria-label="My Profile"
                        title="My Profile"
                        onClick={() => navigate("/devotee/profile")}
                        className="header-profile-button"
                    >
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="header-profile-image"
                            />
                        ) : (
                            <UserCircle size={23} />
                        )}
                    </button>
                </div>
            </header>

            <div className="devotee-grid">

                <div className="devotee-main">

                    {/* Jagannath Temple Banner */}
                    <section
                        className="hero-banner"
                        style={{
                            backgroundImage: `linear-gradient(
                                90deg,
                                rgba(18, 15, 38, 0.75),
                                rgba(18, 15, 38, 0.10)
                            ), url(${jagannathBanner})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    >
                        <div className="hero-content">
                            <span className="hero-label">
                                WELCOME TO ODISHA
                            </span>

                            <h2>Shree Jagannath Dham, Puri</h2>

                            <p>
                                Book your Darshan, get digital tickets and explore Odisha.
                            </p>

                            <button onClick={() => navigate("/devotee/book")}>
                                Book Darshan
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions">

                        <Link to="/devotee/book" className="quick-card">
                            <span className="quick-icon purple">
                                <CalendarDays />
                            </span>
                            <span>
                                <strong>Book Darshan</strong>
                                <small>Check slots & reserve</small>
                            </span>
                        </Link>

                        <Link to="/devotee/bookings" className="quick-card">
                            <span className="quick-icon green">
                                <Ticket />
                            </span>
                            <span>
                                <strong>My Bookings</strong>
                                <small>View and manage</small>
                            </span>
                        </Link>

                        <Link to="/devotee/tickets" className="quick-card">
                            <span className="quick-icon blue">
                                <QrCode />
                            </span>
                            <span>
                                <strong>My Tickets</strong>
                                <small>View QR tickets</small>
                            </span>
                        </Link>

                        <Link to="/devotee/destinations" className="quick-card">
                            <span className="quick-icon orange">
                                <MapPin />
                            </span>
                            <span>
                                <strong>Explore Odisha</strong>
                                <small>Discover destinations</small>
                            </span>
                        </Link>

                    </section>

                    {/* Explore Odisha */}
                    <section className="destinations-section">

                        <div className="section-heading">
                            <h2>Explore Odisha</h2>

                            <Link to="/devotee/destinations">
                                View All
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {destinationsLoading ? (
                            <p>Loading destinations...</p>
                        ) : destinations.length === 0 ? (
                            <p>
                                No destinations published yet. Please check back soon.
                            </p>
                        ) : (
                            <div className="destination-grid">
                                {destinations.map((destination) => (
                                    <article
                                        className="destination-card"
                                        key={destination.id}
                                        onClick={() =>
                                            navigate(
                                                `/devotee/destinations/${encodeURIComponent(destination.slug)}`
                                            )
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <img
                                            src={destination.imageUrl}
                                            alt={destination.name}
                                        />

                                        <h3>{destination.name}</h3>
                                    </article>
                                ))}
                            </div>
                        )}

                    </section>

                    {/* Explore Festivals of Odisha */}
                    <section className="destinations-section">

                        <div className="section-heading">
                            <h2>Explore Festivals of Odisha</h2>

                            <Link to="/devotee/festivals">
                                View All
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {festivalsLoading ? (
                            <p>Loading festivals...</p>
                        ) : festivals.length === 0 ? (
                            <p>No festivals available yet. Please check back soon.</p>
                        ) : (
                            <div className="destination-grid">

                                {festivals.map((festival) => (
                                    <article
                                        className="destination-card"
                                        key={festival.id}
                                        onClick={() =>
                                            navigate(`/devotee/festivals/${festival.id}`)
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <img
                                            src={festival.imageUrl}
                                            alt={festival.name}
                                        />

                                        <h3>{festival.name}</h3>
                                    </article>
                                ))}

                            </div>
                        )}

                    </section>

                </div>

                {/* Right Sidebar */}
                <aside className="devotee-right">

                    {/* Puri Weather */}
                    <section className="weather-card">
                        <h3>Puri Weather</h3>

                        {weatherLoading ? (
                            <p>Loading Puri weather...</p>
                        ) : weatherError ? (
                            <p>{weatherError}</p>
                        ) : weather ? (
                            <>
                                <div className="weather-info">
                                    <CloudSun size={48} />

                                    <div>
                                        <h2>{Math.round(weather.temperature)}°C</h2>
                                        <p>{weather.weatherDescription}</p>
                                    </div>
                                </div>

                                <small>
                                    {weather.destination}, Odisha
                                </small>

                                <div className="weather-extra">
                                    <div>
                                        <strong>{weather.feelsLike}°C</strong>
                                        <span>Feels Like</span>
                                    </div>

                                    <div>
                                        <strong>{weather.humidity}%</strong>
                                        <span>Humidity</span>
                                    </div>

                                    <div>
                                        <strong>{weather.windSpeed} m/s</strong>
                                        <span>Wind Speed</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p>Weather information unavailable.</p>
                        )}
                    </section>

                    {/* My Next Darshan */}
                    <section className="next-darshan-card">
                        <h2>My Next Darshan</h2>

                        {nextDarshanLoading ? (
                            <p>Loading your next Darshan...</p>
                        ) : nextDarshan ? (
                            <>
                                <div className="darshan-details">
                                    <div className="temple-icon">🛕</div>

                                    <div>
                                        <h3>Shree Jagannath Temple</h3>

                                        <p>
                                            {formatDate(
                                                nextDarshan.darshanDate ||
                                                nextDarshan.darshanSlot?.slotDate
                                            )}
                                        </p>

                                        <p>
                                            {nextDarshan.categoryType ||
                                                nextDarshan.darshanSlot?.category?.type ||
                                                "Darshan"} Darshan
                                        </p>

                                        <p>
                                            Visitors: {nextDarshan.visitorCount}
                                        </p>

                                        <p className="darshan-reference">
                                            Booking ID: {nextDarshan.bookingReference}
                                        </p>

                                        <span className="darshan-status">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => navigate("/devotee/bookings")}>
                                    <Ticket size={17} />
                                    View My Bookings
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="darshan-details">
                                    <div className="temple-icon">🛕</div>

                                    <div>
                                        <h3>No upcoming Darshan</h3>
                                        <p>
                                            No confirmed upcoming tickets found.
                                            Book your Darshan to see your ticket here.
                                        </p>
                                    </div>
                                </div>

                                <button onClick={() => navigate("/devotee/book")}>
                                    <CalendarDays size={17} />
                                    Book Darshan
                                </button>
                            </>
                        )}
                    </section>

                </aside>

            </div>

            <FloatingChatAssistant />

        </div>
    );
}

export default DevoteeDashboard;
