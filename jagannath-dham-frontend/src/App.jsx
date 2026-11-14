
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

// Devotee Pages
import DevoteeDashboard from "./pages/devotee/DevoteeDashboard";
import DevoteeBookings from "./pages/devotee/DevoteeBookings";
import DevoteeTickets from "./pages/devotee/DevoteeTickets";
import DevoteeDestinations from "./pages/devotee/DevoteeDestinations";
import DestinationDetails from "./pages/devotee/DestinationDetails";
import DevoteeFestivals from "./pages/devotee/DevoteeFestivals";
import DevoteeFestivalDetails from "./pages/devotee/DevoteeFestivalDetails";
import DevoteeBooking from "./pages/devotee/DevoteeBooking";
import DevoteeProfile from "./pages/devotee/DevoteeProfile";
import DevoteeSupport from "./pages/devotee/DevoteeSupport";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffScanner from "./pages/staff/StaffScanner";
import StaffScanHistory from "./pages/staff/StaffScanHistory";
import StaffProfile from "./pages/staff/StaffProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSlots from "./pages/admin/AdminSlots";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminFestivals from "./pages/admin/AdminFestivals";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Devotee Routes */}
        <Route element={<ProtectedRoute allowedRole="USER" />}>
          <Route element={<DashboardLayout role="USER" />}>
            <Route path="/devotee" element={<DevoteeDashboard />} />
            <Route path="/devotee/bookings" element={<DevoteeBookings />} />
            <Route path="/devotee/book" element={<DevoteeBooking />} />
            <Route path="/devotee/tickets" element={<DevoteeTickets />} />
            <Route path="/devotee/destinations" element={<DevoteeDestinations />} />
            <Route path="/devotee/destinations/:slug" element={<DestinationDetails />} />
            <Route path="/devotee/festivals" element={<DevoteeFestivals />} />
            <Route path="/devotee/festivals/:id" element={<DevoteeFestivalDetails />} />
            <Route path="/devotee/profile" element={<DevoteeProfile />} />
            <Route path="/devotee/support" element={<DevoteeSupport />} />
          </Route>
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRole="STAFF" />}>
          <Route element={<DashboardLayout role="STAFF" />}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/scanner" element={<StaffScanner />} />
            <Route path="/staff/history" element={<StaffScanHistory />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route element={<DashboardLayout role="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/destinations" element={<AdminDestinations />} />
            <Route path="/admin/festivals" element={<AdminFestivals />} />
            <Route path="/admin/slots" element={<AdminSlots />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
