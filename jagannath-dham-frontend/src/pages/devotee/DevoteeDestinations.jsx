
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Search,
    ArrowUpRight,
    Compass,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";
import "./DevoteeDestinations.css";

function DevoteeDestinations() {
    const navigate = useNavigate();

    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/destinations/published");

            setDestinations(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Destination fetch error:", err);
            setError("Unable to load destinations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredDestinations = destinations.filter((destination) => {
        const search = searchTerm.trim().toLowerCase();

        return (
            destination.name?.toLowerCase().includes(search) ||
            destination.district?.toLowerCase().includes(search) ||
            destination.shortDescription?.toLowerCase().includes(search)
        );
    });

    const openDestination = (slug) => {
        if (!slug) return;

        navigate(`/devotee/destinations/${encodeURIComponent(slug)}`);
    };

    return (
        <div className="destinations-page">

            {/* Page Header */}
            <div className="destinations-header">
                <div>
                    <span className="destinations-eyebrow">
                        DISCOVER THE BEAUTY OF ODISHA
                    </span>

                    <h1>Explore Odisha</h1>

                    <p>
                        Discover spiritual places, ancient heritage and
                        beautiful destinations across Odisha.
                    </p>
                </div>

                <div className="explore-header-icon">
                    <Compass size={35} />
                </div>
            </div>

            {/* Search */}
            <div className="destinations-search">
                <Search size={20} />

                <input
                    type="text"
                    placeholder="Search destinations or districts..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
            </div>

            {/* Results Heading */}
            <div className="destinations-results-heading">
                <h2>Published Destinations</h2>

                <span>
                    {loading
                        ? "Loading..."
                        : `${filteredDestinations.length} places found`}
                </span>
            </div>

            {/* Loading */}
            {loading && (
                <div className="no-destinations">
                    <p>Loading destinations...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="no-destinations">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>

                    <button onClick={fetchDestinations}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            )}

            {/* Destination Cards */}
            {!loading && !error && filteredDestinations.length > 0 && (
                <div className="explore-destination-grid">

                    {filteredDestinations.map((destination) => (
                        <article
                            className="explore-destination-card"
                            key={destination.id}
                        >
                            {/* Destination Image */}
                            <div className="explore-destination-image">
                                {destination.imageUrl ? (
                                    <img
                                        src={destination.imageUrl}
                                        alt={destination.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="destination-image-placeholder">
                                        <MapPin size={35} />
                                    </div>
                                )}
                            </div>

                            {/* Destination Information */}
                            <div className="explore-destination-content">

                                <h3>{destination.name}</h3>

                                <div className="destination-location">
                                    <MapPin size={15} />
                                    <span>
                                        {destination.district || "Odisha"}
                                    </span>
                                </div>

                                <p>
                                    {destination.shortDescription ||
                                        "Explore this beautiful destination in Odisha."}
                                </p>

                                {/* Open Full Details Page */}
                                <button
                                    className="destination-details-btn"
                                    onClick={() =>
                                        openDestination(destination.slug)
                                    }
                                    disabled={!destination.slug}
                                >
                                    Explore Place
                                    <ArrowUpRight size={17} />
                                </button>

                            </div>
                        </article>
                    ))}

                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredDestinations.length === 0 && (
                <div className="no-destinations">
                    <MapPin size={35} />

                    <h3>
                        {searchTerm
                            ? "No matching destinations found"
                            : "No destinations available yet"}
                    </h3>

                    <p>
                        {searchTerm
                            ? "Try searching with another name or district."
                            : "Published destinations added by the administrator will appear here."}
                    </p>
                </div>
            )}

        </div>
    );
}

export default DevoteeDestinations;
