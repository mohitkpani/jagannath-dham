
import { useEffect, useState } from "react";
import { Send, LoaderCircle, CircleHelp } from "lucide-react";
import api from "../../services/api";
import "./DevoteeSupport.css";

function DevoteeSupport() {
    const [issue, setIssue] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Automatically remove messages after 3 seconds
    useEffect(() => {
        if (!success && !error) return;

        const timer = setTimeout(() => {
            setSuccess("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [success, error]);

    // Submit support issue
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!issue.trim()) {
            setError("Please describe your issue.");
            return;
        }

        setSending(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.post("/support", {
                issue: issue.trim()
            });

            setSuccess(
                typeof response.data === "string"
                    ? response.data
                    : "Your issue has been sent successfully."
            );

            setIssue("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send your issue. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="devotee-support">

            {/* Page Header */}
            <div className="support-page-header">
                <h1>Help & Support</h1>
                <p>
                    Facing a problem? Tell us about it and we'll help you.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="support-alert">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="support-success">
                    {success}
                </div>
            )}

            {/* Support Form */}
            <section className="support-card">

                <div className="support-card-heading">
                    <div className="support-icon">
                        <CircleHelp size={24} />
                    </div>

                    <div>
                        <h2>Submit an Issue</h2>
                        <p>
                            Describe the problem you're experiencing.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="support-field">
                        <label htmlFor="support-issue">
                            Your Issue
                        </label>

                        <textarea
                            id="support-issue"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            placeholder="Describe your issue here..."
                            rows={6}
                            maxLength={3000}
                            required
                            disabled={sending}
                        />

                        <small>
                            {issue.length}/3000 characters
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="support-submit-btn"
                        disabled={sending || !issue.trim()}
                    >
                        {sending ? (
                            <LoaderCircle
                                size={18}
                                className="support-spinner"
                            />
                        ) : (
                            <Send size={17} />
                        )}

                        {sending ? "Sending..." : "Send Issue"}
                    </button>

                </form>

            </section>
        </div>
    );
}

export default DevoteeSupport;
