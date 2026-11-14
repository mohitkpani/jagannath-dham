
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Users,
    ArrowLeft,
    ArrowRight,
    MapPin,
    CheckCircle2,
    IndianRupee
} from "lucide-react";

import api from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import "./DevoteeBooking.css";

// Load Razorpay Checkout.js
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

function DevoteeBooking() {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const [date, setDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [visitorCount, setVisitorCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const today = new Date();

    const minDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    // Fetch Admin-configured categories and fees
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories");

                setCategories(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (err) {
                console.error("Category fetch error:", err);
                setError("Unable to load darshan category prices.");
            }
        };

        fetchCategories();
    }, []);

    // Fetch slots whenever the selected date changes
    useEffect(() => {
        if (!date) {
            setSlots([]);
            setSelectedSlot(null);
            return;
        }

        const fetchSlots = async () => {
            try {
                setLoading(true);
                setError("");
                setSelectedSlot(null);
                setVisitorCount(1);

                const response = await api.get(
                    `/darshan-slots/date?date=${date}`
                );

                setSlots(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (err) {
                console.error("Slot fetch error:", err);

                setSlots([]);

                setError(
                    err.response?.data?.message ||
                    "Unable to load available darshan categories."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [date]);

    // Match each slot with its category
    const getCategory = (slot) => {
        return categories.find(
            (category) => category.id === slot.categoryId
        );
    };

    // Select category
    const handleSlotSelection = (slot) => {
        const category = getCategory(slot);

        if (
            !category ||
            !category.active ||
            !slot.active ||
            slot.availableCapacity <= 0
        ) {
            return;
        }

        setSelectedSlot(slot);
        setVisitorCount(1);
        setError("");
        setSuccess("");
    };

    const selectedCategory = selectedSlot
        ? getCategory(selectedSlot)
        : null;

    const totalAmount = selectedCategory
        ? Number(selectedCategory.fee) * Number(visitorCount || 0)
        : 0;

    // Refresh slots after successful booking
    const refreshSlots = async () => {
        if (!date) return;

        try {
            const response = await api.get(
                `/darshan-slots/date?date=${date}`
            );

            const updatedSlots = Array.isArray(response.data)
                ? response.data
                : [];

            setSlots(updatedSlots);

            const updatedSelectedSlot = updatedSlots.find(
                (slot) => slot.id === selectedSlot?.id
            );

            setSelectedSlot(updatedSelectedSlot || null);
        } catch (err) {
            console.error("Slot refresh error:", err);
        }
    };


    // Continue to booking/payment
    const handleContinue = async () => {
        if (!date || !selectedSlot || !selectedCategory) {
            setError("Please select a date and darshan category.");
            return;
        }

        if (!selectedCategory.active) {
            setError("This darshan category is currently inactive.");
            return;
        }

        if (
            !Number.isInteger(visitorCount) ||
            visitorCount < 1 ||
            visitorCount > selectedSlot.availableCapacity
        ) {
            setError("Please enter a valid visitor count.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Ask backend to create the booking/order.
            const response = await api.post("/bookings/create-order", {
                darshanSlotId: selectedSlot.id,
                visitorCount: visitorCount
            });

            let order = response.data;

            // Handle a JSON-string response from backend
            if (typeof order === "string") {
                order = JSON.parse(order);
            }

            // FREE DARSHAN: booking is already confirmed by backend
            if (order?.bookingConfirmed === true) {
                addNotification(
                    "Darshan Booking Confirmed",
                    `Your free Darshan booking for ${visitorCount} visitor(s) has been confirmed successfully.`,
                    "SUCCESS"
                );

                setSuccess(
                    "Free Darshan booking confirmed successfully! Your QR ticket is ready."
                );

                await refreshSlots();

                setTimeout(() => {
                    navigate("/devotee/bookings");
                }, 2500);

                return;
            }

            // PAID DARSHAN: Load Razorpay Checkout
            const loaded = await loadRazorpayScript();

            if (!loaded) {
                throw new Error("Unable to load Razorpay Checkout.");
            }

            if (
                !order ||
                !order.orderId ||
                !order.keyId ||
                !order.amount
            ) {
                throw new Error(
                    "Invalid payment order response. Check the backend response."
                );
            }

            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "Jagannath Dham",
                description: "Darshan Booking",
                order_id: order.orderId,

                handler: async function (paymentResponse) {
                    try {
                        setLoading(true);
                        setError("");

                        await api.post("/bookings/verify-payment", {
                            orderId: paymentResponse.razorpay_order_id,
                            paymentId: paymentResponse.razorpay_payment_id,
                            signature: paymentResponse.razorpay_signature
                        });

                        addNotification(
                            "Darshan Booking Confirmed",
                            `Your Darshan booking for ${visitorCount} visitor(s) has been confirmed successfully. Payment was successful.`,
                            "SUCCESS"
                        );

                        setSuccess(
                            "Payment successful! Your Darshan booking is confirmed."
                        );

                        await refreshSlots();

                        setTimeout(() => {
                            navigate("/devotee/bookings");
                        }, 2500);

                    } catch (verificationError) {
                        console.error(
                            "Payment verification error:",
                            verificationError
                        );

                        setError(
                            verificationError.response?.data?.message ||
                            "Payment was received, but verification failed. Please contact support before trying another payment."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                theme: {
                    color: "#7c3aed"
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on("payment.failed", function (paymentError) {
                console.error("Razorpay payment failed:", paymentError);

                setError(
                    paymentError.error?.description ||
                    "Payment failed. Please try again."
                );

                setLoading(false);
            });

            razorpayInstance.open();

        } catch (err) {
            console.error("Booking payment error:", err);

            const message =
                err.response?.data?.message ||
                err.message ||
                "Unable to initiate booking. Please try again.";

            setError(message);
            setLoading(false);
        }
    };


    return (
        <div className="darshan-booking-page">

            <button
                className="booking-back-btn"
                onClick={() => navigate("/devotee/bookings")}
                disabled={loading}
            >
                <ArrowLeft size={17} />
                Back to My Bookings
            </button>

            <div className="booking-page-heading">
                <span>DARSHAN RESERVATION</span>

                <h1>Book Your Darshan</h1>

                <p>
                    Plan your visit to Shree Jagannath Dham.
                    Select your date and preferred darshan category.
                </p>
            </div>

            <div className="booking-form-card">

                {/* Date selection */}
                <div className="booking-step-heading">
                    <span className="booking-step-icon">
                        <CalendarDays size={21} />
                    </span>

                    <div>
                        <h2>Select Darshan Date</h2>
                        <p>Choose your preferred visit date.</p>
                    </div>
                </div>

                <input
                    className="booking-date-input"
                    type="date"
                    min={minDate}
                    value={date}
                    disabled={loading}
                    onChange={(event) => {
                        setDate(event.target.value);
                        setError("");
                        setSuccess("");
                    }}
                />

                {/* Category selection */}
                {date && (
                    <>
                        <div className="booking-step-heading">
                            <span className="booking-step-icon">
                                <MapPin size={21} />
                            </span>

                            <div>
                                <h2>Select Darshan Category</h2>
                                <p>
                                    Choose an active category with
                                    available capacity.
                                </p>
                            </div>
                        </div>

                        {loading && (
                            <p className="booking-info-message">
                                Processing your request...
                            </p>
                        )}

                        {!loading && slots.length > 0 && (
                            <div className="booking-slot-grid">

                                {slots.map((slot) => {
                                    const category = getCategory(slot);

                                    const unavailable =
                                        !slot.active ||
                                        slot.availableCapacity <= 0 ||
                                        !category ||
                                        !category.active;

                                    return (
                                        <button
                                            type="button"
                                            key={slot.id}
                                            className={`booking-slot-option ${selectedSlot?.id === slot.id
                                                ? "selected"
                                                : ""
                                                }`}
                                            disabled={unavailable || loading}
                                            onClick={() =>
                                                handleSlotSelection(slot)
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {slot.categoryType}
                                                </strong>

                                                <span>
                                                    {slot.availableCapacity} visitors
                                                    available
                                                </span>

                                                <span>
                                                    {category
                                                        ? `₹${Number(
                                                            category.fee
                                                        ).toFixed(2)} per visitor`
                                                        : "Price unavailable"}
                                                </span>
                                            </div>

                                            {selectedSlot?.id === slot.id && (
                                                <CheckCircle2 size={21} />
                                            )}
                                        </button>
                                    );
                                })}

                            </div>
                        )}

                        {!loading && slots.length === 0 && !error && (
                            <p className="booking-info-message">
                                No active darshan categories are available
                                for this date.
                            </p>
                        )}
                    </>
                )}

                {/* Visitor count and price */}
                {selectedSlot && selectedCategory && (
                    <div className="booking-visitor-section">

                        <div className="booking-step-heading">
                            <span className="booking-step-icon">
                                <Users size={21} />
                            </span>

                            <div>
                                <h2>Number of Visitors</h2>

                                <p>
                                    Maximum available capacity:{" "}
                                    {selectedSlot.availableCapacity}
                                </p>
                            </div>
                        </div>

                        <input
                            type="number"
                            min="1"
                            max={selectedSlot.availableCapacity}
                            step="1"
                            value={visitorCount}
                            disabled={loading}
                            onChange={(event) => {
                                const value = event.target.value;

                                setVisitorCount(
                                    value === "" ? "" : Number(value)
                                );

                                setError("");
                            }}
                        />

                        <div className="booking-price-summary">

                            <div>
                                <span>Category</span>
                                <strong>{selectedCategory.type}</strong>
                            </div>

                            <div>
                                <span>Fee per visitor</span>
                                <strong>
                                    ₹{Number(
                                        selectedCategory.fee
                                    ).toFixed(2)}
                                </strong>
                            </div>

                            <div>
                                <span>Visitors</span>
                                <strong>{visitorCount || 0}</strong>
                            </div>

                            <div className="booking-total">
                                <span>Total Amount</span>

                                <strong>
                                    <IndianRupee size={17} />
                                    {totalAmount.toFixed(2)}
                                </strong>
                            </div>

                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <p className="booking-error">
                        {error}
                    </p>
                )}

                {/* Success message */}
                {success && (
                    <p className="booking-success">
                        {success}
                    </p>
                )}

                {/* Payment button */}
                <button
                    type="button"
                    className="booking-continue-btn"
                    onClick={handleContinue}
                    disabled={
                        loading ||
                        !selectedSlot ||
                        !selectedCategory ||
                        !Number.isInteger(visitorCount) ||
                        visitorCount < 1 ||
                        visitorCount > selectedSlot.availableCapacity
                    }
                >
                    {loading
                        ? "Processing..."
                        : "Continue to Payment"}

                    {!loading && <ArrowRight size={18} />}
                </button>

            </div>
        </div>
    );
}

export default DevoteeBooking;
