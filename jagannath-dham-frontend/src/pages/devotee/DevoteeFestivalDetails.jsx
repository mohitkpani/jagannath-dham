
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    CalendarHeart,
    BookOpen,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";
import "./DevoteeFestivalDetails.css";

function DevoteeFestivalDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [festival, setFestival] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFestival = async () => {
            try {
                setLoading(true);
                setError("");
                setFestival(null);

                const response = await api.get(`/festivals/${id}`);
                setFestival(response.data);
            } catch (err) {
                console.error("Festival fetch error:", err);
                setError("Unable to load this festival.");
            } finally {
                setLoading(false);
            }
        };

        fetchFestival();
    }, [id]);

    if (loading) {
        return (
            <div className="festival-details-state">
                <p>Loading festival details...</p>
            </div>
        );
    }

    if (error || !festival) {
        return (
            <div className="festival-details-state">
                <h2>Festival not found</h2>
                <p>{error || "This festival is unavailable."}</p>

                <button onClick={() => navigate("/devotee/festivals")}>
                    <ArrowLeft size={17} />
                    Back to Festivals
                </button>
            </div>
        );
    }

    return (
        <div className="festival-details-page">

            <button
                className="festival-back-btn"
                onClick={() => navigate("/devotee/festivals")}
            >
                <ArrowLeft size={18} />
                Back to Festivals
            </button>

            <div className="festival-hero">
                {festival.imageUrl ? (
                    <img
                        src={festival.imageUrl}
                        alt={festival.name}
                    />
                ) : (
                    <div className="festival-hero-placeholder">
                        <CalendarHeart size={48} />
                    </div>
                )}

                <div className="festival-hero-overlay">
                    <span>CELEBRATE THE CULTURE OF ODISHA</span>

                    <h1>{festival.name}</h1>

                    <p>
                        <MapPin size={17} />
                        {festival.location || "Odisha"}
                    </p>
                </div>
            </div>

            <div className="festival-details-content">

                <main className="festival-description">

                    <span className="festival-section-label">
                        ABOUT THIS FESTIVAL
                    </span>

                    <h2>Discover {festival.name}</h2>

                    <p>
                        {festival.description ||
                            "Festival information is currently unavailable."}
                    </p>

                    {festival.significance && (
                        <div className="festival-info-block">
                            <h3>
                                <BookOpen size={19} />
                                Cultural & Religious Significance
                            </h3>

                            <p>{festival.significance}</p>
                        </div>
                    )}

                </main>

                <aside className="festival-info-card">

                    <div className="festival-info-heading">
                        <CalendarHeart size={28} />

                        <div>
                            <span>FESTIVAL MONTH</span>
                            <h2>{festival.month}</h2>
                        </div>
                    </div>

                    <div className="festival-info-location">
                        <MapPin size={19} />

                        <div>
                            <span>Celebrated At</span>
                            <strong>{festival.location || "Odisha"}</strong>
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    );
}

export default DevoteeFestivalDetails;
