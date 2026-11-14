
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

function ProtectedRoute({ allowedRole }) {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    // Redirect users who are not logged in
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Prevent access to another role's dashboard
    if (user.role !== allowedRole) {
        switch (user.role) {
            case "USER":
                return <Navigate to="/devotee" replace />;

            case "STAFF":
                return <Navigate to="/staff" replace />;

            case "ADMIN":
                return <Navigate to="/admin" replace />;

            default:
                authService.logout();
                return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
}

export default ProtectedRoute;
