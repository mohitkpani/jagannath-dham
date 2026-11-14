
import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (title, message, type = "INFO") => {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date()
        };

        setNotifications((prev) => [notification, ...prev]);
    };

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isRead: true } : item
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, isRead: true }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(
        (item) => !item.isRead
    ).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
