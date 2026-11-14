
import { useEffect, useState } from "react";

import {
    QrCode,
    Ticket,
    Download,
    MapPin,
    CalendarDays,
    LoaderCircle,
    AlertCircle
} from "lucide-react";

import api from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import "./DevoteeTickets.css";

function DevoteeTickets() {
    const { addNotification } = useNotifications();

    const [tickets, setTickets] = useState([]);
    const [qrImages, setQrImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const imageUrls = [];

        const loadTickets = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/bookings/my");

                const bookings = Array.isArray(response.data)
                    ? response.data
                    : [];

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const confirmedBookings = bookings.filter((booking) => {
                    const darshanDate =
                        booking.darshanDate ||
                        booking.darshanSlot?.slotDate ||
                        booking.slotDate;

                    if (!darshanDate) return false;

                    const date = new Date(`${darshanDate}T00:00:00`);

                    return (
                        booking.bookingStatus === "CONFIRMED" &&
                        booking.paymentStatus === "SUCCESS" &&
                        booking.ticketUsed !== true &&
                        !Number.isNaN(date.getTime()) &&
                        date >= today
                    );
                });

                if (mounted) {
                    setTickets(confirmedBookings);
                }

                const imageResults = await Promise.all(
                    confirmedBookings.map(async (booking) => {
                        try {
                            const qrResponse = await api.get(
                                `/bookings/${booking.id}/ticket/qr`,
                                { responseType: "blob" }
                            );

                            const imageUrl = URL.createObjectURL(
                                qrResponse.data
                            );

                            imageUrls.push(imageUrl);

                            return {
                                id: booking.id,
                                imageUrl
                            };
                        } catch (err) {
                            console.error(
                                `Unable to load QR for booking ${booking.id}:`,
                                err
                            );

                            return {
                                id: booking.id,
                                imageUrl: null
                            };
                        }
                    })
                );

                if (mounted) {
                    const images = {};

                    imageResults.forEach((result) => {
                        images[result.id] = result.imageUrl;
                    });

                    setQrImages(images);
                }

            } catch (err) {
                console.error("Unable to load tickets:", err);

                if (mounted) {
                    setError(
                        "Unable to load your tickets. Please try again."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTickets();

        return () => {
            mounted = false;

            imageUrls.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    const downloadQr = (bookingId) => {
        const imageUrl = qrImages[bookingId];

        if (!imageUrl) return;

        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `Darshan-Ticket-${bookingId}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addNotification(
            "QR Ticket Downloaded",
            `Your Darshan ticket ${bookingId} was downloaded successfully.`,
            "SUCCESS"
        );
    };

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const getBookingDate = (booking) => {
        return (
            booking.darshanDate ||
            booking.darshanSlot?.slotDate ||
            booking.slotDate ||
            null
        );
    };

    const getCategory = (booking) => {
        return (
            booking.categoryType ||
            booking.darshanSlot?.category?.type ||
            booking.darshanSlot?.category?.categoryType ||
            "Darshan"
        );
    };

    return (
        <div className="tickets-page">

            <div className="tickets-header">
                <div>
                    <h1>My Tickets</h1>
                    <p>
                        Access your digital Darshan tickets and QR codes.
                    </p>
                </div>
            </div>

            <div className="tickets-info-card">
                <div className="tickets-info-icon">
                    <QrCode size={28} />
                </div>

                <div>
                    <h3>Your Digital Darshan Tickets</h3>
                    <p>
                        Show your original QR code at the entry gate
                        for verification.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="tickets-empty-state">
                    <LoaderCircle className="animate-spin" size={36} />
                    <h2>Loading your tickets...</h2>
                    <p>Please wait while we retrieve your bookings.</p>
                </div>
            )}

            {!loading && error && (
                <div className="tickets-empty-state">
                    <AlertCircle size={36} />
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && tickets.length === 0 && (
                <div className="tickets-empty-state">
                    <div className="tickets-empty-icon">
                        <Ticket size={38} />
                    </div>

                    <h2>No active tickets available</h2>

                    <p>
                        Your confirmed and upcoming unused Darshan tickets
                        will appear here.
                    </p>
                </div>
            )}

            {!loading && !error && tickets.length > 0 && (
                <div className="tickets-list">

                    {tickets.map((booking) => (
                        <div className="ticket-card" key={booking.id}>

                            <div className="ticket-card-header">
                                <div>
                                    <span className="ticket-label">
                                        DIGITAL DARSHAN TICKET
                                    </span>

                                    <h3>
                                        Booking #{booking.bookingReference || booking.id}
                                    </h3>
                                </div>

                                <span className="ticket-status">
                                    CONFIRMED
                                </span>
                            </div>

                            <div className="ticket-card-body">

                                <div className="ticket-details">

                                    <div>
                                        <CalendarDays size={18} />
                                        <span>
                                            {formatDate(getBookingDate(booking))}
                                        </span>
                                    </div>

                                    <div>
                                        <Ticket size={18} />
                                        <span>
                                            Visitors: {booking.visitorCount}
                                        </span>
                                    </div>

                                    <div>
                                        <Ticket size={18} />
                                        <span>
                                            Ticket Type: {getCategory(booking)}
                                        </span>
                                    </div>

                                    <div>
                                        <MapPin size={18} />
                                        <span>
                                            Shri Jagannath Dham
                                        </span>
                                    </div>

                                </div>

                                <div className="ticket-qr-section">

                                    {qrImages[booking.id] ? (
                                        <>
                                            <img
                                                src={qrImages[booking.id]}
                                                alt="Darshan ticket QR code"
                                                className="ticket-qr-image"
                                            />

                                            <p>Show this QR code at the entry gate.</p>

                                            <button
                                                className="ticket-download-btn"
                                                onClick={() => downloadQr(booking.id)}
                                            >
                                                <Download size={17} />
                                                Download QR
                                            </button>
                                        </>
                                    ) : (
                                        <div className="ticket-qr-unavailable">
                                            <QrCode size={38} />
                                            <p>
                                                QR image is unavailable in the app.
                                                Please use your booking confirmation
                                                email if it contains the original QR.
                                            </p>
                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            )}

            <div className="ticket-instructions">
                <h3>How to use your digital ticket</h3>

                <div className="ticket-instruction-grid">

                    <div>
                        <QrCode size={24} />
                        <h4>1. Get your QR code</h4>
                        <p>Find your confirmed ticket here.</p>
                    </div>

                    <div>
                        <Download size={24} />
                        <h4>2. Keep it ready</h4>
                        <p>Save your ticket on your device.</p>
                    </div>

                    <div>
                        <MapPin size={24} />
                        <h4>3. Visit the entry gate</h4>
                        <p>Show your QR code to the staff.</p>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default DevoteeTickets;
