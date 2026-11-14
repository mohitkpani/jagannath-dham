
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Search,
    ArrowUpRight,
    CalendarHeart,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";
import "./DevoteeFestivals.css";

function DevoteeFestivals() {
    const navigate = useNavigate();

    const [festivals, setFestivals] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFestivals();
    }, []);

    const fetchFestivals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/festivals");

            setFestivals(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Festival fetch error:", err);
            setError("Unable to load festivals. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredFestivals = festivals.filter((festival) => {
        const search = searchTerm.trim().toLowerCase();

        return (
            festival.name?.toLowerCase().includes(search) ||
            festival.month?.toLowerCase().includes(search) ||
            festival.location?.toLowerCase().includes(search)
        );
    });

    const openFestival = (id) => {
        navigate(`/devotee/festivals/${id}`);
    };

    return (
        <div className="festivals-page">

            <div className="festivals-header">
                <div>
                    <span className="festivals-eyebrow">
                        CELEBRATE THE CULTURE OF ODISHA
                    </span>

                    <h1>Festivals of Odisha</h1>

                    <p>
                        Discover the vibrant festivals, traditions and
                        cultural celebrations of Odisha.
                    </p>
                </div>

                <div className="festivals-header-icon">
                    <CalendarHeart size={35} />
                </div>
            </div>

            <div className="festivals-search">
                <Search size={20} />

                <input
                    type="text"
                    placeholder="Search festivals, months or locations..."
                    value={searchTerm}
                    onChange={(event) =>
                        setSearchTerm(event.target.value)
                    }
                />
            </div>

            <div className="festivals-results-heading">
                <h2>Odisha Festivals</h2>

                <span>
                    {loading
                        ? "Loading..."
                        : `${filteredFestivals.length} festivals found`}
                </span>
            </div>

            {loading && (
                <div className="no-festivals">
                    <p>Loading festivals...</p>
                </div>
            )}

            {!loading && error && (
                <div className="no-festivals">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>

                    <button onClick={fetchFestivals}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && filteredFestivals.length > 0 && (
                <div className="explore-festival-grid">

                    {filteredFestivals.map((festival) => (
                        <article
                            className="explore-festival-card"
                            key={festival.id}
                        >
                            <div className="explore-festival-image">
                                {festival.imageUrl ? (
                                    <img
                                        src={festival.imageUrl}
                                        alt={festival.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="festival-image-placeholder">
                                        <CalendarHeart size={35} />
                                    </div>
                                )}
                            </div>

                            <div className="explore-festival-content">

                                <h3>{festival.name}</h3>

                                <div className="festival-location">
                                    <MapPin size={15} />
                                    <span>
                                        {festival.location || "Odisha"}
                                    </span>
                                </div>

                                <div className="festival-month">
                                    <CalendarHeart size={15} />
                                    <span>{festival.month}</span>
                                </div>

                                <button
                                    className="festival-details-btn"
                                    onClick={() =>
                                        openFestival(festival.id)
                                    }
                                >
                                    Explore Festival
                                    <ArrowUpRight size={17} />
                                </button>

                            </div>
                        </article>
                    ))}

                </div>
            )}

            {!loading && !error && filteredFestivals.length === 0 && (
                <div className="no-festivals">
                    <CalendarHeart size={35} />

                    <h3>
                        {searchTerm
                            ? "No matching festivals found"
                            : "No festivals available yet"}
                    </h3>

                    <p>
                        {searchTerm
                            ? "Try searching with another festival name, month or location."
                            : "Festivals added by the administrator will appear here."}
                    </p>
                </div>
            )}

        </div>
    );
}

export default DevoteeFestivals;
