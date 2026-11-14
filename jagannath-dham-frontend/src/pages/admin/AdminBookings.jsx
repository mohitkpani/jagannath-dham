
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./AdminBookings.css";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get("/bookings");
                setBookings(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const monthlyData = useMemo(() => {
        const groups = {};

        bookings.forEach((booking) => {
            const date = booking.bookedAt?.substring(0, 10);
            if (!date) return;

            const month = date.substring(0, 7);

            if (!groups[month]) groups[month] = {};
            if (!groups[month][date]) groups[month][date] = [];

            groups[month][date].push(booking);
        });

        return groups;
    }, [bookings]);

    const months = Object.keys(monthlyData).sort().reverse();
    const confirmedCount = bookings.filter(
        (booking) => booking.bookingStatus === "CONFIRMED"
    ).length;

    const cancelledCount = bookings.filter(
        (booking) => booking.bookingStatus === "CANCELLED"
    ).length;

    const formatMonth = (month) =>
        new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });

    const formatDate = (date) =>
        new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    const selectedMonthDates = selectedMonth
        ? Object.keys(monthlyData[selectedMonth]).sort().reverse()
        : [];

    const selectedDayBookings =
        selectedMonth && selectedDate
            ? monthlyData[selectedMonth][selectedDate] || []
            : [];

    if (loading) return <div className="admin-bookings">Loading bookings...</div>;
    if (error) return <div className="admin-bookings">{error}</div>;

    return (
        <div className="admin-bookings">
            <h1>Bookings Management</h1>
            <p>View and manage historical darshan bookings.</p>

            <div className="booking-summary-grid">
                <div className="booking-summary-card">
                    <span>Total Bookings</span>
                    <h2>{bookings.length}</h2>
                </div>

                <div className="booking-summary-card confirmed-summary">
                    <span>Confirmed Bookings</span>
                    <h2>{confirmedCount}</h2>
                </div>

                <div className="booking-summary-card cancelled-summary">
                    <span>Cancelled Bookings</span>
                    <h2>{cancelledCount}</h2>
                </div>
            </div>

            {!selectedMonth && (
                <>
                    <h2>Monthly Booking History</h2>

                    <div className="booking-history-grid">
                        {months.map((month) => {
                            const count = Object.values(monthlyData[month])
                                .reduce((total, dayBookings) =>
                                    total + dayBookings.length, 0);

                            return (
                                <button
                                    className="booking-history-card"
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                >
                                    <h3>{formatMonth(month)}</h3>
                                    <strong>{count}</strong>
                                    <span>Total Bookings</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {selectedMonth && !selectedDate && (
                <>
                    <button
                        className="booking-back-button"
                        onClick={() => setSelectedMonth(null)}
                    >
                        ← Back to Months
                    </button>

                    <h2>{formatMonth(selectedMonth)}</h2>

                    <div className="booking-history-grid">
                        {selectedMonthDates.map((date) => (
                            <button
                                className="booking-history-card"
                                key={date}
                                onClick={() => setSelectedDate(date)}
                            >
                                <h3>{formatDate(date)}</h3>
                                <strong>
                                    {monthlyData[selectedMonth][date].length}
                                </strong>
                                <span>Total Bookings</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {selectedDate && !selectedBooking && (
                <>
                    <button
                        className="booking-back-button"
                        onClick={() => setSelectedDate(null)}
                    >
                        ← Back to Days
                    </button>

                    <h2>Bookings - {formatDate(selectedDate)}</h2>

                    <div className="bookings-list">
                        {selectedDayBookings.map((booking) => (
                            <div className="booking-list-item" key={booking.id}>
                                <div>
                                    <strong>{booking.bookingReference}</strong>
                                    <p>{booking.user?.fullName || "N/A"}</p>
                                    <span>{booking.bookingStatus}</span>
                                </div>

                                <button
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {selectedBooking && (
                <>
                    <button
                        className="booking-back-button"
                        onClick={() => setSelectedBooking(null)}
                    >
                        ← Back to Bookings
                    </button>

                    <h2>Booking Details</h2>

                    <div className="booking-details-card">
                        <h3>{selectedBooking.bookingReference}</h3>

                        <h4>Devotee Information</h4>
                        <p><strong>Name:</strong> {selectedBooking.user?.fullName || "N/A"}</p>
                        <p><strong>Email:</strong> {selectedBooking.user?.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedBooking.user?.phone || "N/A"}</p>

                        <h4>Darshan Information</h4>
                        <p><strong>Category:</strong> {selectedBooking.darshanSlot?.category?.type || "N/A"}</p>
                        <p><strong>Darshan Date:</strong> {selectedBooking.darshanSlot?.slotDate || "N/A"}</p>
                        <p><strong>Visitors:</strong> {selectedBooking.visitorCount}</p>

                        <h4>Payment Information</h4>
                        <p><strong>Amount:</strong> ₹{Number(selectedBooking.amount || 0).toLocaleString("en-IN")}</p>
                        <p><strong>Payment Status:</strong> {selectedBooking.paymentStatus}</p>
                        <p><strong>Booking Status:</strong> {selectedBooking.bookingStatus}</p>
                        <p><strong>Razorpay Order ID:</strong> {selectedBooking.razorpayOrderId || "N/A"}</p>
                        <p><strong>Payment ID:</strong> {selectedBooking.razorpayPaymentId || "N/A"}</p>
                        <p><strong>Booked At:</strong> {selectedBooking.bookedAt?.replace("T", " ") || "N/A"}</p>
                    </div>
                </>
            )}

            {bookings.length === 0 && (
                <p>No bookings available.</p>
            )}
        </div>
    );
};

export default AdminBookings;
