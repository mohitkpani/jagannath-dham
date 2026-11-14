
import { useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import "./NotificationBell.css";

function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    } = useNotifications();

    return (
        <div className="notification-container">

            <button
                className="notification-bell"
                aria-label="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={21} />

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">

                    <div className="notification-header">
                        <h3>Notifications</h3>

                        <button
                            className="notification-close"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {notifications.length > 0 ? (
                        <>
                            <div className="notification-tools">
                                <button onClick={markAllAsRead}>
                                    <CheckCheck size={15} />
                                    Mark all as read
                                </button>

                                <button onClick={clearNotifications}>
                                    Clear all
                                </button>
                            </div>

                            <div className="notification-list">
                                {notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`notification-item ${item.isRead ? "read" : "unread"
                                            }`}
                                        onClick={() => markAsRead(item.id)}
                                    >
                                        <div className="notification-item-content">
                                            <strong>{item.title}</strong>
                                            <p>{item.message}</p>

                                            <small>
                                                {item.createdAt.toLocaleTimeString(
                                                    "en-IN",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }
                                                )}
                                            </small>
                                        </div>

                                        {!item.isRead && (
                                            <span className="notification-dot" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="notification-empty">
                            <Bell size={30} />
                            <h4>No notifications yet</h4>
                            <p>Your recent activities will appear here.</p>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default NotificationBell;
