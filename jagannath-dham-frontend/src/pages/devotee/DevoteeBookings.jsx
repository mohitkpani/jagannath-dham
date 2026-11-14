
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

import {
    CalendarDays,
    Clock,
    Ticket,
    Search,
    Users,
    IndianRupee,
    Eye,
    CalendarX
} from "lucide-react";

import api from "../../services/api";
import "./DevoteeBookings.css";

function DevoteeBookings() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/bookings/my");

            setBookings(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Failed to fetch bookings:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your bookings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // CANCEL BOOKING
    const handleCancelBooking = async (booking) => {
        if (booking.ticketUsed) {
            alert("This ticket has already been used and cannot be cancelled.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to cancel booking ${booking.bookingReference || `#${booking.id}`}?`
        );

        if (!confirmed) return;

        try {
            setCancellingId(booking.id);

            await api.put(`/bookings/${booking.id}/cancel`);

            addNotification(
                "Booking Cancelled",
                `Your booking ${booking.bookingReference || `#${booking.id}`} has been cancelled successfully.`,
                "SUCCESS"
            );

            alert("Booking cancelled successfully.");

            await fetchBookings();
        } catch (err) {
            console.error("Failed to cancel booking:", err);

            alert(
                err.response?.data?.message ||
                "Unable to cancel booking. Please try again."
            );
        } finally {
            setCancellingId(null);
        }
    };

    const handleNewBooking = () => {
        navigate("/devotee/book");
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

    // Supports both the new DTO and the previous entity response.
    const getBookingDate = (booking) => {
        return (
            booking.darshanDate ||
            booking.darshanSlot?.slotDate ||
            booking.slotDate ||
            null
        );
    };

    const isUpcomingBooking = (booking) => {
        const date = getBookingDate(booking);

        if (!date || booking.bookingStatus !== "CONFIRMED") {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return new Date(`${date}T00:00:00`) >= today;
    };

    // A past confirmed booking is expired only if it was not scanned.
    const isExpiredBooking = (booking) => {
        const date = getBookingDate(booking);

        if (
            !date ||
            booking.bookingStatus !== "CONFIRMED" ||
            booking.ticketUsed
        ) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(`${date}T00:00:00`);

        return bookingDate < today;
    };

    const getCategory = (booking) => {
        return (
            booking.categoryType ||
            booking.darshanSlot?.category?.type ||
            booking.darshanSlot?.category?.categoryType ||
            booking.darshanSlot?.categoryType ||
            "Darshan"
        );
    };

    // SEARCH AND FILTER
    const filteredBookings = bookings.filter((booking) => {
        const reference = booking.bookingReference || "";
        const category = getCategory(booking);

        let status;

        if (booking.ticketUsed && booking.bookingStatus === "CONFIRMED") {
            status = "USED";
        } else if (isExpiredBooking(booking)) {
            status = "EXPIRED";
        } else {
            status = booking.bookingStatus || "";
        }

        const matchesSearch =
            reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" || status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // BOOKING SUMMARY
    const totalBookings = bookings.length;

    const upcomingBookings = bookings.filter((booking) => {
        return isUpcomingBooking(booking);
    }).length;

    const completedBookings = bookings.filter((booking) => {
        const date = getBookingDate(booking);

        if (!date) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return new Date(`${date}T00:00:00`) < today;
    }).length;

    // LOADING
    if (loading) {
        return (
            <div className="bookings-page">
                <div className="bookings-header">
                    <div>
                        <h1>My Bookings</h1>
                        <p>Loading your Darshan reservations...</p>
                    </div>
                </div>

                <div className="empty-bookings">
                    <p>Please wait while we fetch your bookings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bookings-page">

            {/* PAGE HEADER */}
            <div className="bookings-header">
                <div>
                    <h1>My Bookings</h1>
                    <p>
                        Manage your Darshan reservations and booking history.
                    </p>
                </div>

                <button
                    className="new-booking-btn"
                    onClick={handleNewBooking}
                >
                    <CalendarDays size={18} />
                    Book Darshan
                </button>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="booking-error">
                    {error}

                    <button onClick={fetchBookings}>
                        Retry
                    </button>
                </div>
            )}

            {/* BOOKING SUMMARY */}
            <div className="booking-summary">

                <div className="booking-stat-card">
                    <span className="booking-stat-icon purple">
                        <Ticket />
                    </span>

                    <div>
                        <h2>{totalBookings}</h2>
                        <p>Total Bookings</p>
                    </div>
                </div>

                <div className="booking-stat-card">
                    <span className="booking-stat-icon green">
                        <CalendarDays />
                    </span>

                    <div>
                        <h2>{upcomingBookings}</h2>
                        <p>Upcoming Darshan</p>
                    </div>
                </div>

                <div className="booking-stat-card">
                    <span className="booking-stat-icon orange">
                        <Clock />
                    </span>

                    <div>
                        <h2>{completedBookings}</h2>
                        <p>Past Darshan Dates</p>
                    </div>
                </div>

            </div>

            {/* BOOKINGS LIST */}
            <div className="booking-list-card">

                <div className="booking-list-header">
                    <div>
                        <h2>All Bookings</h2>
                        <p>Your Darshan reservation details</p>
                    </div>

                    <div className="booking-filters">

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="USED">Used</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="PENDING">Pending</option>
                        </select>

                        <div className="booking-search">
                            <Search size={16} />

                            <input
                                type="text"
                                placeholder="Search booking..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* EMPTY STATE */}
                {!error && bookings.length === 0 && (
                    <div className="empty-bookings">
                        <div className="empty-bookings-icon">
                            <Ticket size={34} />
                        </div>

                        <h3>Your bookings will appear here</h3>

                        <p>
                            Once you complete a Darshan booking and payment,
                            your reservation details will appear here.
                        </p>

                        <button
                            className="new-booking-btn"
                            onClick={handleNewBooking}
                        >
                            <CalendarDays size={17} />
                            Book Your Darshan
                        </button>
                    </div>
                )}

                {/* NO SEARCH RESULTS */}
                {bookings.length > 0 && filteredBookings.length === 0 && (
                    <div className="empty-bookings">
                        <Search size={30} />

                        <h3>No matching bookings found</h3>

                        <p>
                            Try changing your search term or booking status.
                        </p>
                    </div>
                )}

                {/* BOOKING CARDS */}
                {filteredBookings.length > 0 && (
                    <div className="booking-cards">

                        {filteredBookings.map((booking) => {

                            const expired = isExpiredBooking(booking);
                            const ticketUsed = booking.ticketUsed === true;
                            const showUsedStatus =
                                ticketUsed && booking.bookingStatus === "CONFIRMED";

                            return (
                                <div
                                    className="booking-card"
                                    key={booking.id}
                                >

                                    <div className="booking-card-top">

                                        <div>
                                            <span className="booking-reference-label">
                                                Booking Reference
                                            </span>

                                            <h3>
                                                {booking.bookingReference || `Booking #${booking.id}`}
                                            </h3>
                                        </div>

                                        {showUsedStatus ? (
                                            <span className="booking-status used">
                                                <Ticket size={13} />
                                                USED
                                            </span>
                                        ) : expired ? (
                                            <span className="booking-status expired">
                                                <CalendarX size={13} />
                                                EXPIRED
                                            </span>
                                        ) : (
                                            <span
                                                className={`booking-status ${(booking.bookingStatus || "").toLowerCase()}`}
                                            >
                                                {booking.bookingStatus || "UNKNOWN"}
                                            </span>
                                        )}

                                    </div>

                                    <div className="booking-card-details">

                                        <div className="booking-detail">
                                            <CalendarDays size={17} />

                                            <div>
                                                <span>Darshan Date</span>
                                                <strong>
                                                    {formatDate(getBookingDate(booking))}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="booking-detail">
                                            <Ticket size={17} />

                                            <div>
                                                <span>Category</span>
                                                <strong>{getCategory(booking)}</strong>
                                            </div>
                                        </div>

                                        <div className="booking-detail">
                                            <Users size={17} />

                                            <div>
                                                <span>Visitors</span>
                                                <strong>{booking.visitorCount ?? "—"}</strong>
                                            </div>
                                        </div>

                                        <div className="booking-detail">
                                            <IndianRupee size={17} />

                                            <div>
                                                <span>Amount Paid</span>
                                                <strong>{formatAmount(booking.amount)}</strong>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="booking-card-bottom">

                                        <span>
                                            Payment: {booking.paymentStatus || "UNKNOWN"}
                                        </span>

                                        <div className="booking-actions">

                                            {isUpcomingBooking(booking) && (
                                                <>
                                                    <button
                                                        className="cancel-booking-btn"
                                                        onClick={() => handleCancelBooking(booking)}
                                                        disabled={
                                                            ticketUsed ||
                                                            cancellingId === booking.id
                                                        }
                                                        title={
                                                            ticketUsed
                                                                ? "This ticket has already been used"
                                                                : "Cancel booking"
                                                        }
                                                    >
                                                        {ticketUsed
                                                            ? "Already Used"
                                                            : cancellingId === booking.id
                                                                ? "Cancelling..."
                                                                : "Cancel Booking"}
                                                    </button>

                                                    <button
                                                        onClick={() => navigate("/devotee/tickets")}
                                                        disabled={ticketUsed}
                                                        title={
                                                            ticketUsed
                                                                ? "This ticket has already been used"
                                                                : "View ticket"
                                                        }
                                                    >
                                                        <Eye size={16} />
                                                        {ticketUsed ? "Ticket Used" : "View Tickets"}
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        </div>
    );
}

export default DevoteeBookings;
