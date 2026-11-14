
import { useState } from "react";
import { MessageCircle, X, Send, Bot, LoaderCircle } from "lucide-react";
import api from "../services/api";
import "./FloatingChatAssistant.css";

function FloatingChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Namaskar! 🙏 Welcome to Jagannath Dham. How can I help you today?"
        }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (event) => {
        event.preventDefault();

        const userMessage = message.trim();

        if (!userMessage || loading) return;

        if (userMessage.length > 1000) {
            return;
        }

        setMessages((prev) => [
            ...prev,
            { role: "user", text: userMessage }
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/chat", {
                message: userMessage
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: response.data.reply
                }
            ]);
        } catch (error) {
            console.error("AI chat error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: error.response?.data?.message ||
                        "Sorry, I'm unable to respond right now. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-container">

            {isOpen && (
                <div className="ai-chat-window">

                    <div className="ai-chat-header">
                        <div className="ai-chat-heading">
                            <span className="ai-chat-avatar">
                                <Bot size={22} />
                            </span>

                            <div>
                                <h3>Jagannath AI Assistant</h3>
                                <p>How can I help you?</p>
                            </div>
                        </div>

                        <button
                            className="ai-chat-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                        >
                            <X size={21} />
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`ai-chat-message ${item.role}`}
                            >
                                {item.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-chat-message assistant ai-chat-loading">
                                <LoaderCircle size={17} className="ai-chat-spinner" />
                                Thinking...
                            </div>
                        )}
                    </div>

                    <form
                        className="ai-chat-input-area"
                        onSubmit={handleSend}
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Ask me anything..."
                            maxLength={1000}
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={!message.trim() || loading}
                            aria-label="Send message"
                        >
                            <Send size={19} />
                        </button>
                    </form>

                </div>
            )}

            <button
                className="ai-chat-floating-btn"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
            >
                {isOpen ? <X size={25} /> : <MessageCircle size={25} />}
            </button>

        </div>
    );
}

export default FloatingChatAssistant;
