
import { useEffect, useRef, useState } from "react";
import {
    User,
    Camera,
    Trash2,
    Mail,
    Phone,
    CalendarDays,
    LoaderCircle,
    Pencil,
    Save,
    X,
    Lock,
    KeyRound,
    Eye,
    EyeOff
} from "lucide-react";

import api from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import "./StaffProfile.css";

function StaffProfile() {
    const { addNotification } = useNotifications();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Edit profile
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    // Change password
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password visibility
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fileInputRef = useRef(null);

    // Load profile
    useEffect(() => {
        fetchProfile();
    }, []);

    // Automatically remove success message
    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [success]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users/profile");

            setProfile(response.data);
            setFullName(response.data.fullName || "");
            setPhone(response.data.phone || "");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    // Edit profile
    const handleEdit = () => {
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setError("");
        setSuccess("");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setIsEditing(false);
        setError("");
    };

    // Update profile
    const handleUpdateProfile = async (event) => {
        event.preventDefault();

        if (!fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (phone.trim().length > 15) {
            setError("Phone number cannot exceed 15 characters.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone: phone.trim()
            });

            setProfile(prev => ({
                ...prev,
                ...response.data
            }));

            setIsEditing(false);
            setSuccess("Profile updated successfully.");

            addNotification(
                "Profile Updated",
                "Your personal profile information was updated successfully.",
                "SUCCESS"
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // Upload profile photo
    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG and WebP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2 MB.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.post(
                "/users/profile/photo",
                formData
            );

            setProfile(response.data);
            setSuccess("Profile photo updated successfully.");

            addNotification(
                "Profile Photo Updated",
                "Your profile photo was changed successfully.",
                "SUCCESS"
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Photo upload failed."
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    // Remove profile photo
    const handleRemovePhoto = async () => {
        if (!window.confirm("Remove your profile photo?")) return;

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.delete("/users/profile/photo");

            setProfile(response.data);
            setSuccess("Profile photo removed.");

            addNotification(
                "Profile Photo Removed",
                "Your profile photo was removed successfully.",
                "SUCCESS"
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to remove photo."
            );
        } finally {
            setUploading(false);
        }
    };

    // Open password form
    const handleOpenPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
        setShowPasswordForm(true);
    };

    // Cancel password form
    const handleCancelPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        setShowPasswordForm(false);
        setError("");
    };

    // Change password
    const handleChangePassword = async (event) => {
        event.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "New password must be different from current password."
            );
            return;
        }

        setChangingPassword(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.put("/users/change-password", {
                currentPassword,
                newPassword,
                confirmPassword
            });

            setShowPasswordForm(false);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess(
                typeof response.data === "string"
                    ? response.data
                    : response.data?.message || "Password changed successfully."
            );

            addNotification(
                "Password Changed",
                "Your account password was changed successfully.",
                "SUCCESS"
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to change password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="staff-profile-loading">
                <LoaderCircle className="staff-profile-spinner" size={25} />
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="staff-profile-error">
                {error || "Profile not found."}
            </div>
        );
    }

    return (
        <div className="staff-profile-page">

            {/* Page Header */}
            <div className="staff-profile-page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>
                        Manage your personal information and profile photo.
                    </p>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="staff-profile-alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="staff-profile-success">
                    {success}
                </div>
            )}

            {/* Profile Card */}
            <section className="staff-profile-card">

                {/* Profile Photo */}
                <div className="staff-profile-photo-section">

                    <div className="staff-profile-photo">
                        {profile.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl}
                                alt="Staff Profile"
                            />
                        ) : (
                            <User size={54} />
                        )}
                    </div>

                    <div className="staff-profile-photo-info">

                        <h2>{profile.fullName}</h2>
                        <p>{profile.role || "STAFF"}</p>

                        <div className="staff-profile-photo-actions">

                            <button
                                className="staff-profile-upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <LoaderCircle
                                        className="staff-profile-spinner"
                                        size={17}
                                    />
                                ) : (
                                    <Camera size={17} />
                                )}

                                {profile.profileImageUrl
                                    ? "Change Photo"
                                    : "Upload Photo"}
                            </button>

                            {profile.profileImageUrl && (
                                <button
                                    className="staff-profile-remove-btn"
                                    onClick={handleRemovePhoto}
                                    disabled={uploading}
                                >
                                    <Trash2 size={17} />
                                    Remove
                                </button>
                            )}

                        </div>

                        <small>
                            JPG, PNG or WebP. Maximum size 2 MB.
                        </small>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handlePhotoChange}
                        />

                    </div>
                </div>

                <div className="staff-profile-divider" />

                {/* Personal Information */}
                <div className="staff-profile-information-header">

                    <h3>Personal Information</h3>

                    {!isEditing && (
                        <button
                            className="staff-profile-edit-btn"
                            onClick={handleEdit}
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>
                    )}

                </div>

                {isEditing ? (

                    <form
                        onSubmit={handleUpdateProfile}
                        className="staff-profile-edit-form"
                    >

                        <div className="staff-profile-edit-field">
                            <label>Full Name</label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="staff-profile-edit-field">
                            <label>Phone Number</label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength={15}
                            />
                        </div>

                        <div className="staff-profile-edit-actions">

                            <button
                                type="submit"
                                className="staff-profile-save-btn"
                                disabled={saving}
                            >
                                {saving ? (
                                    <LoaderCircle
                                        className="staff-profile-spinner"
                                        size={17}
                                    />
                                ) : (
                                    <Save size={17} />
                                )}

                                Save Changes
                            </button>

                            <button
                                type="button"
                                className="staff-profile-cancel-btn"
                                onClick={handleCancelEdit}
                                disabled={saving}
                            >
                                <X size={17} />
                                Cancel
                            </button>

                        </div>
                    </form>

                ) : (

                    <div className="staff-profile-information-grid">

                        <div className="staff-profile-info-item">
                            <Mail size={19} />
                            <div>
                                <span>Email Address</span>
                                <strong>
                                    {profile.email || "Not available"}
                                </strong>
                            </div>
                        </div>

                        <div className="staff-profile-info-item">
                            <Phone size={19} />
                            <div>
                                <span>Phone Number</span>
                                <strong>
                                    {profile.phone || "Not provided"}
                                </strong>
                            </div>
                        </div>

                        <div className="staff-profile-info-item">
                            <User size={19} />
                            <div>
                                <span>Full Name</span>
                                <strong>{profile.fullName || "—"}</strong>
                            </div>
                        </div>

                        <div className="staff-profile-info-item">
                            <CalendarDays size={19} />
                            <div>
                                <span>Member Since</span>
                                <strong>
                                    {profile.createdAt
                                        ? new Date(
                                            profile.createdAt
                                        ).toLocaleDateString("en-IN")
                                        : "Not available"}
                                </strong>
                            </div>
                        </div>

                    </div>
                )}

                <div className="staff-profile-divider" />

                {/* Account Security */}
                <div className="staff-profile-information-header">

                    <div className="staff-profile-security-heading">
                        <Lock size={19} />
                        <h3>Account Security</h3>
                    </div>

                    {!showPasswordForm && (
                        <button
                            className="staff-profile-edit-btn"
                            onClick={handleOpenPasswordForm}
                        >
                            <KeyRound size={16} />
                            Change Password
                        </button>
                    )}

                </div>

                {showPasswordForm && (

                    <form
                        onSubmit={handleChangePassword}
                        className="staff-profile-password-form"
                    >

                        <div className="staff-profile-edit-field">
                            <label>Current Password</label>

                            <div className="staff-profile-password-input">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrentPassword(prev => !prev)
                                    }
                                    aria-label="Toggle current password visibility"
                                >
                                    {showCurrentPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="staff-profile-edit-field">
                            <label>New Password</label>

                            <div className="staff-profile-password-input">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewPassword(prev => !prev)
                                    }
                                    aria-label="Toggle new password visibility"
                                >
                                    {showNewPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="staff-profile-edit-field">
                            <label>Confirm New Password</label>

                            <div className="staff-profile-password-input">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(prev => !prev)
                                    }
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="staff-profile-password-hint">
                            Your new password must contain at least 8 characters.
                        </div>

                        <div className="staff-profile-edit-actions">

                            <button
                                type="submit"
                                className="staff-profile-save-btn"
                                disabled={changingPassword}
                            >
                                {changingPassword ? (
                                    <LoaderCircle
                                        className="staff-profile-spinner"
                                        size={17}
                                    />
                                ) : (
                                    <Lock size={17} />
                                )}

                                Update Password
                            </button>

                            <button
                                type="button"
                                className="staff-profile-cancel-btn"
                                onClick={handleCancelPasswordForm}
                                disabled={changingPassword}
                            >
                                <X size={17} />
                                Cancel
                            </button>

                        </div>

                    </form>
                )}

            </section>
        </div>
    );
}

export default StaffProfile;
