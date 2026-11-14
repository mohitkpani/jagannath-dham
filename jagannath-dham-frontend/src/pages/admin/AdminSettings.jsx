
import { useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    Camera,
    Trash2,
    Save,
    Lock,
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    Pencil
} from "lucide-react";

import api from "../../services/api";
import "./AdminSettings.css";

const initialProfile = {
    fullName: "",
    email: "",
    phone: "",
    profileImageUrl: "",
    role: "ADMIN",
    createdAt: ""
};

const initialPassword = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const AdminSettings = () => {

    // States
    const [profile, setProfile] = useState(initialProfile);
    const [password, setPassword] = useState(initialPassword);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [editingProfile, setEditingProfile] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [visiblePasswords, setVisiblePasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    // Fetch admin profile
    useEffect(() => {
        fetchProfile();
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    // Fetch profile
    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await api.get("/users/profile");

            setProfile({
                fullName: response.data.fullName || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                profileImageUrl: response.data.profileImageUrl || "",
                role: response.data.role || "ADMIN",
                createdAt: response.data.createdAt || ""
            });

        } catch (error) {
            console.error("Admin profile error:", error);

            showMessage(
                error.response?.data?.message ||
                "Unable to load admin profile.",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };

    // Profile input changes
    const handleProfileChange = (e) => {
        setProfile((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Password input changes
    const handlePasswordChange = (e) => {
        setPassword((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Show/hide password
    const togglePasswordVisibility = (field) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!profile.fullName.trim()) {
            showMessage("Full name is required.", "error");
            return;
        }

        if (profile.fullName.length > 100) {
            showMessage(
                "Full name cannot exceed 100 characters.",
                "error"
            );
            return;
        }

        if (profile.phone.length > 15) {
            showMessage(
                "Phone number cannot exceed 15 characters.",
                "error"
            );
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.put("/users/profile", {
                fullName: profile.fullName.trim(),
                phone: profile.phone
            });

            setProfile((prev) => ({
                ...prev,
                fullName: response.data.fullName || prev.fullName,
                phone: response.data.phone || ""
            }));

            setEditingProfile(false);

            showMessage("Profile updated successfully.");

        } catch (error) {
            console.error("Profile update error:", error);

            showMessage(
                error.response?.data?.message ||
                "Unable to update profile.",
                "error"
            );

        } finally {
            setSavingProfile(false);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!password.currentPassword) {
            showMessage("Enter your current password.", "error");
            return;
        }

        if (password.newPassword.length < 8) {
            showMessage(
                "New password must be at least 8 characters.",
                "error"
            );
            return;
        }

        if (password.newPassword !== password.confirmPassword) {
            showMessage("New passwords do not match.", "error");
            return;
        }

        if (password.currentPassword === password.newPassword) {
            showMessage(
                "New password must be different from the current password.",
                "error"
            );
            return;
        }

        try {
            setChangingPassword(true);

            const response = await api.put(
                "/users/change-password",
                password
            );

            setPassword(initialPassword);
            setShowPasswordForm(false);

            showMessage(
                typeof response.data === "string"
                    ? response.data
                    : "Password changed successfully."
            );

        } catch (error) {
            console.error("Password change error:", error);

            showMessage(
                error.response?.data?.message ||
                "Unable to change password. Check your current password.",
                "error"
            );

        } finally {
            setChangingPassword(false);
        }
    };

    // Upload profile photo
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage("Please select an image file.", "error");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(
                "Image size must not exceed 5 MB.",
                "error"
            );
            e.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadingPhoto(true);

            const response = await api.post(
                "/users/profile/photo",
                formData
            );

            setProfile((prev) => ({
                ...prev,
                profileImageUrl: response.data.profileImageUrl || ""
            }));

            showMessage("Profile photo updated successfully.");

        } catch (error) {
            console.error("Photo upload error:", error);

            showMessage(
                error.response?.data?.message ||
                "Unable to upload profile photo.",
                "error"
            );

        } finally {
            setUploadingPhoto(false);
            e.target.value = "";
        }
    };

    // Remove profile photo
    const handleRemovePhoto = async () => {
        if (!profile.profileImageUrl) return;

        if (!window.confirm("Remove your profile photo?")) {
            return;
        }

        try {
            const response = await api.delete("/users/profile/photo");

            setProfile((prev) => ({
                ...prev,
                profileImageUrl: response.data.profileImageUrl || ""
            }));

            showMessage("Profile photo removed successfully.");

        } catch (error) {
            console.error("Photo removal error:", error);

            showMessage(
                error.response?.data?.message ||
                "Unable to remove profile photo.",
                "error"
            );
        }
    };

    // Loading screen
    if (loading) {
        return (
            <div className="admin-settings">
                Loading admin settings...
            </div>
        );
    }

    // Main UI
    return (
        <div className="admin-settings">

            {/* Page heading */}
            <div className="settings-header">
                <h1>My Profile</h1>
                <p>
                    Manage your personal information and profile photo.
                </p>
            </div>

            {/* Success / Error message */}
            {message && (
                <div className={`settings-message ${messageType}`}>
                    {message}
                </div>
            )}

            {/* Main profile card */}
            <section
                className="admin-profile-card"
                id="admin-profile-section"
            >

                {/* Profile photo and identity */}
                <div className="admin-profile-top">

                    <div className="admin-profile-avatar">
                        {profile.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl}
                                alt="Admin profile"
                            />
                        ) : (
                            <UserRound size={42} />
                        )}
                    </div>

                    <div className="admin-profile-identity">

                        <h2>
                            {profile.fullName || "Admin"}
                        </h2>

                        <span>
                            {profile.role}
                        </span>

                        <div className="settings-photo-actions">

                            <label className="settings-upload-btn">
                                <Camera size={16} />

                                {uploadingPhoto
                                    ? "Uploading..."
                                    : "Change Photo"}

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    hidden
                                    disabled={uploadingPhoto}
                                    onChange={handlePhotoUpload}
                                />
                            </label>

                            {profile.profileImageUrl && (
                                <button
                                    type="button"
                                    className="settings-remove-btn"
                                    onClick={handleRemovePhoto}
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            )}

                        </div>

                        <small>
                            JPG, PNG or WebP. Maximum size 5 MB.
                        </small>

                    </div>
                </div>

                <div className="profile-divider" />

                {/* Personal information */}
                <div className="profile-section-heading">

                    <h3>Personal Information</h3>

                    <button
                        type="button"
                        className="settings-primary-btn"
                        onClick={() => setEditingProfile(!editingProfile)}
                    >
                        {editingProfile ? (
                            <>
                                Cancel Editing
                            </>
                        ) : (
                            <>
                                <Pencil size={16} />
                                Edit Profile
                            </>
                        )}
                    </button>

                </div>

                {/* Profile details view */}
                {!editingProfile ? (

                    <div className="admin-profile-details">

                        <div className="profile-detail">
                            <Mail />

                            <div>
                                <span>Email Address</span>
                                <strong>
                                    {profile.email || "Not available"}
                                </strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <Phone />

                            <div>
                                <span>Phone Number</span>
                                <strong>
                                    {profile.phone || "Not provided"}
                                </strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <UserRound />

                            <div>
                                <span>Full Name</span>
                                <strong>
                                    {profile.fullName || "Not available"}
                                </strong>
                            </div>
                        </div>

                        <div className="profile-detail">
                            <CalendarDays />

                            <div>
                                <span>Member Since</span>
                                <strong>
                                    {profile.createdAt
                                        ? new Date(profile.createdAt)
                                            .toLocaleDateString("en-IN")
                                        : "Not available"}
                                </strong>
                            </div>
                        </div>

                    </div>

                ) : (

                    /* Profile edit form */
                    <form
                        className="settings-edit-form"
                        onSubmit={handleProfileSubmit}
                    >

                        <div className="settings-field">
                            <label>Full Name</label>

                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleProfileChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="settings-field">
                            <label>Email Address</label>

                            <input
                                type="email"
                                value={profile.email}
                                disabled
                            />

                            <small>
                                Email address cannot be changed here.
                            </small>
                        </div>

                        <div className="settings-field">
                            <label>Phone Number</label>

                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                maxLength={15}
                            />
                        </div>

                        <div className="settings-edit-actions">
                            <button
                                type="submit"
                                className="settings-primary-btn"
                                disabled={savingProfile}
                            >
                                <Save size={16} />

                                {savingProfile
                                    ? "Saving..."
                                    : "Save Profile"}
                            </button>
                        </div>

                    </form>

                )}

                <div className="profile-divider" />

                {/* Account security */}
                <div className="profile-section-heading security-heading">

                    <div className="security-title">
                        <Lock size={21} />
                        <h3>Account Security</h3>
                    </div>

                    <button
                        type="button"
                        className="settings-primary-btn"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        <Lock size={16} />

                        {showPasswordForm
                            ? "Cancel"
                            : "Change Password"}
                    </button>

                </div>

                {/* Password change form */}
                {showPasswordForm && (

                    <form
                        className="settings-password-form"
                        onSubmit={handlePasswordSubmit}
                    >

                        {[
                            {
                                name: "currentPassword",
                                label: "Current Password"
                            },
                            {
                                name: "newPassword",
                                label: "New Password"
                            },
                            {
                                name: "confirmPassword",
                                label: "Confirm New Password"
                            }
                        ].map((field) => (

                            <div
                                className="settings-field"
                                key={field.name}
                            >

                                <label>{field.label}</label>

                                <div className="settings-password-input">

                                    <input
                                        type={
                                            visiblePasswords[field.name]
                                                ? "text"
                                                : "password"
                                        }
                                        name={field.name}
                                        value={password[field.name]}
                                        onChange={handlePasswordChange}
                                        autoComplete="off"
                                        required
                                        minLength={
                                            field.name === "newPassword"
                                                ? 8
                                                : undefined
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            togglePasswordVisibility(field.name)
                                        }
                                        aria-label={
                                            visiblePasswords[field.name]
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {visiblePasswords[field.name]
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>

                                </div>

                                {field.name === "newPassword" && (
                                    <small>
                                        Minimum 8 characters.
                                    </small>
                                )}

                            </div>

                        ))}

                        <div className="settings-edit-actions">
                            <button
                                type="submit"
                                className="settings-primary-btn"
                                disabled={changingPassword}
                            >
                                <Lock size={16} />

                                {changingPassword
                                    ? "Changing Password..."
                                    : "Update Password"}
                            </button>
                        </div>

                    </form>

                )}

            </section>

        </div>
    );
};

export default AdminSettings;
