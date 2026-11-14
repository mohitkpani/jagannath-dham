
import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    Camera,
    CameraOff,
    CheckCircle,
    XCircle,
    RefreshCw,
    ShieldCheck,
    MapPin,
    CalendarDays,
    Users
} from "lucide-react";

import api from "../../services/api";
import "./StaffScanner.css";

function StaffScanner() {

    const scannerRef = useRef(null);
    const processingRef = useRef(false);

    const [gateCode, setGateCode] = useState("GATE-01");
    const [cameraRunning, setCameraRunning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const stopCamera = async () => {
        const scanner = scannerRef.current;

        if (!scanner) return;

        try {
            if (scanner.isScanning) {
                await scanner.stop();
            }
        } catch (err) {
            console.error("Camera stop error:", err);
        }

        setCameraRunning(false);
    };

    const startCamera = async () => {
        try {
            setError("");
            setResult(null);

            const scanner = new Html5Qrcode("staff-qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {

                    if (processingRef.current) return;

                    processingRef.current = true;
                    setProcessing(true);

                    await stopCamera();

                    try {
                        const response = await api.post("/qr/scan", {
                            qrToken: decodedText,
                            gateCode: gateCode.trim()
                        });

                        setResult(response.data);

                    } catch (err) {
                        console.error("QR verification error:", err);

                        setResult(
                            err.response?.data || {
                                successful: false,
                                scanResult: "ERROR",
                                message:
                                    err.response?.data?.message ||
                                    "Unable to verify this QR ticket."
                            }
                        );
                    } finally {
                        setProcessing(false);
                    }
                },
                () => {
                    // Ignore continuous QR detection messages.
                }
            );

            setCameraRunning(true);

        } catch (err) {
            console.error("Camera error:", err);

            setError(
                "Unable to access the camera. Please allow camera permission and try again."
            );

            setCameraRunning(false);
        }
    };

    const resetScanner = () => {
        processingRef.current = false;
        setResult(null);
        setError("");
    };

    useEffect(() => {
        return () => {
            const scanner = scannerRef.current;

            if (scanner?.isScanning) {
                scanner.stop()
                    .then(() => scanner.clear())
                    .catch((err) =>
                        console.error("Scanner cleanup error:", err)
                    );
            }
        };
    }, []);

    return (
        <div className="staff-scanner-page">

            {/* Header */}
            <div className="staff-scanner-header">
                <div>
                    <span>STAFF PANEL</span>
                    <h1>QR Ticket Scanner</h1>
                    <p>
                        Scan devotee tickets to verify Darshan entry.
                    </p>
                </div>
            </div>

            <div className="staff-scanner-grid">

                {/* Scanner Card */}
                <div className="staff-scanner-card">

                    <div className="staff-scanner-card-heading">
                        <h2>
                            <Camera size={21} />
                            Scan QR Ticket
                        </h2>

                        <span className={
                            cameraRunning ? "camera-active" : "camera-inactive"
                        }>
                            {cameraRunning ? "Camera Active" : "Camera Off"}
                        </span>
                    </div>

                    {/* Gate Selection */}
                    <div className="staff-gate-input">
                        <label htmlFor="gateCode">
                            Gate Code
                        </label>

                        <input
                            id="gateCode"
                            type="text"
                            value={gateCode}
                            onChange={(e) => setGateCode(e.target.value)}
                            placeholder="Enter gate code"
                            disabled={cameraRunning || processing}
                        />
                    </div>

                    {/* Camera Area */}
                    <div className="staff-camera-container">

                        <div
                            id="staff-qr-reader"
                            className="staff-qr-reader"
                        />

                        {!cameraRunning && !result && !processing && (
                            <div className="staff-camera-placeholder">
                                <Camera size={48} />
                                <h3>Camera Ready</h3>
                                <p>
                                    Start the camera and position the
                                    devotee's QR ticket inside the frame.
                                </p>
                            </div>
                        )}

                        {processing && (
                            <div className="staff-camera-placeholder">
                                <RefreshCw size={35} className="scanner-spin" />
                                <h3>Verifying Ticket...</h3>
                                <p>Please wait while we verify the QR ticket.</p>
                            </div>
                        )}

                    </div>

                    {error && (
                        <div className="staff-scanner-error">
                            <XCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Camera Controls */}
                    <div className="staff-scanner-controls">

                        {!cameraRunning && !result && !processing && (
                            <button
                                className="staff-start-camera-btn"
                                onClick={startCamera}
                                disabled={!gateCode.trim()}
                            >
                                <Camera size={18} />
                                Start Camera
                            </button>
                        )}

                        {cameraRunning && (
                            <button
                                className="staff-stop-camera-btn"
                                onClick={stopCamera}
                            >
                                <CameraOff size={18} />
                                Stop Camera
                            </button>
                        )}

                        {result && (
                            <button
                                className="staff-start-camera-btn"
                                onClick={resetScanner}
                            >
                                <RefreshCw size={18} />
                                Scan Next Ticket
                            </button>
                        )}

                    </div>

                </div>

                {/* Verification Result */}
                <div className="staff-verification-card">

                    <div className="staff-verification-heading">
                        <ShieldCheck size={22} />
                        <h2>Verification Result</h2>
                    </div>

                    {!result ? (
                        <div className="staff-result-empty">
                            <ShieldCheck size={45} />
                            <h3>Waiting for Scan</h3>
                            <p>
                                Ticket verification details will appear here
                                after scanning.
                            </p>
                        </div>
                    ) : (
                        <div className={`staff-result-content ${result.successful ? "approved" : "rejected"
                            }`}>

                            <div className="staff-result-status-icon">
                                {result.successful ? (
                                    <CheckCircle size={48} />
                                ) : (
                                    <XCircle size={48} />
                                )}
                            </div>

                            <h2>
                                {result.successful
                                    ? "Entry Approved"
                                    : "Entry Rejected"}
                            </h2>

                            <span className="staff-result-code">
                                {result.scanResult}
                            </span>

                            <p className="staff-result-message">
                                {result.message}
                            </p>

                            <div className="staff-result-details">

                                <div>
                                    <span>Booking Reference</span>
                                    <strong>
                                        {result.bookingReference || "Unavailable"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong>
                                        {result.category || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Darshan Date</span>
                                    <strong>
                                        <CalendarDays size={15} />
                                        {result.darshanDate || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Visitors</span>
                                    <strong>
                                        <Users size={15} />
                                        {result.visitorCount ?? "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Gate</span>
                                    <strong>
                                        <MapPin size={15} />
                                        {result.gateCode || "N/A"}
                                    </strong>
                                </div>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default StaffScanner;
