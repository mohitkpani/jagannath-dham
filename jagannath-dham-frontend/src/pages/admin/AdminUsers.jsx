
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminUsers.css";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users/admin/all");
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const query = search.toLowerCase();

        const matchesSearch =
            user.fullName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query);

        const matchesRole =
            roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleCreateStaff = async (e) => {
        e.preventDefault();

        try {
            setCreating(true);
            setMessage("");

            await api.post("/users/admin/staff", formData);

            setMessage("Staff account created successfully!");

            setFormData({
                fullName: "",
                email: "",
                password: "",
                phone: ""
            });

            setShowCreateForm(false);

            const response = await api.get("/users/admin/all");
            setUsers(response.data);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to create staff account."
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>{error}</div>;


    return (
        <div className="admin-users">

            <div className="users-page-header">
                <div>
                    <h1>Users & Staff Management</h1>
                    <p>View registered devotees and staff accounts.</p>
                </div>

                <button
                    className="create-staff-btn"
                    onClick={() => {
                        setMessage("");
                        setShowCreateForm(!showCreateForm);
                    }}
                >
                    + Create Staff
                </button>
            </div>

            {message && <p className="staff-message">{message}</p>}

            {showCreateForm && (
                <form className="create-staff-form" onSubmit={handleCreateStaff}>
                    <h2>Create Staff Account</h2>

                    <input
                        type="text"
                        placeholder="Full Name"
                        maxLength={100}
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({
                            ...formData,
                            fullName: e.target.value
                        })}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({
                            ...formData,
                            email: e.target.value
                        })}
                    />

                    <input
                        type="password"
                        placeholder="Password (minimum 8 characters)"
                        minLength={8}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({
                            ...formData,
                            password: e.target.value
                        })}
                    />

                    <input
                        type="tel"
                        placeholder="Phone Number (optional)"
                        maxLength={15}
                        value={formData.phone}
                        onChange={(e) => setFormData({
                            ...formData,
                            phone: e.target.value
                        })}
                    />

                    <div className="staff-form-actions">
                        <button type="submit" disabled={creating}>
                            {creating ? "Creating..." : "Create Account"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="users-summary">
                <div>
                    <span>Total Accounts</span>
                    <h2>{users.length}</h2>
                </div>
                <div>
                    <span>Devotees</span>
                    <h2>{users.filter(u => u.role === "USER").length}</h2>
                </div>
                <div>
                    <span>Staff</span>
                    <h2>{users.filter(u => u.role === "STAFF").length}</h2>
                </div>
            </div>

            <div className="users-filters">
                <input
                    type="text"
                    placeholder="Search name, email or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">All Accounts</option>
                    <option value="USER">Devotees</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* User Cards */}
            <div className="users-card-grid">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div className="user-card" key={user.id}>

                            <div className="user-card-top">
                                <img
                                    src={
                                        user.profileImageUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=eee8f6&color=6639a6&size=96`
                                    }
                                    alt={user.fullName}
                                    className="user-card-avatar"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                            "https://ui-avatars.com/api/?name=User&background=eee8f6&color=6639a6&size=96";
                                    }}
                                />

                                <div className="user-card-identity">
                                    <h3>{user.fullName}</h3>
                                    <span className={`user-role role-${user.role.toLowerCase()}`}>
                                        {user.role === "USER"
                                            ? "Devotee"
                                            : user.role === "STAFF"
                                                ? "Staff"
                                                : "Admin"}
                                    </span>
                                </div>

                                <span className={
                                    user.active
                                        ? "user-status active"
                                        : "user-status inactive"
                                }>
                                    {user.active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <button
                                className="view-user-btn"
                                onClick={() => setSelectedUser(user)}
                            >
                                View Details
                            </button>

                        </div>
                    ))
                ) : (
                    <p className="no-users-found">No accounts found.</p>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div
                    className="user-modal-overlay"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="user-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="user-modal-close"
                            onClick={() => setSelectedUser(null)}
                        >
                            ×
                        </button>

                        <div className="user-modal-profile">
                            <img
                                src={
                                    selectedUser.profileImageUrl ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName || "User")}&background=eee8f6&color=6639a6&size=160`
                                }
                                alt={selectedUser.fullName}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                        "https://ui-avatars.com/api/?name=User&background=eee8f6&color=6639a6&size=160";
                                }}
                            />

                            <h2>{selectedUser.fullName}</h2>

                            <span>
                                {selectedUser.role === "USER"
                                    ? "Devotee"
                                    : selectedUser.role === "STAFF"
                                        ? "Staff"
                                        : "Admin"}
                            </span>
                        </div>

                        <div className="user-details-list">
                            <div>
                                <span>User ID</span>
                                <strong>{selectedUser.id}</strong>
                            </div>

                            <div>
                                <span>Email Address</span>
                                <strong>{selectedUser.email}</strong>
                            </div>

                            <div>
                                <span>Phone Number</span>
                                <strong>{selectedUser.phone || "Not provided"}</strong>
                            </div>

                            <div>
                                <span>Account Status</span>
                                <strong>
                                    {selectedUser.active ? "Active" : "Inactive"}
                                </strong>
                            </div>

                            <div>
                                <span>Registered Date</span>
                                <strong>
                                    {selectedUser.createdAt
                                        ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN")
                                        : "N/A"}
                                </strong>
                            </div>
                        </div>

                        <button
                            className="close-details-btn"
                            onClick={() => setSelectedUser(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );

};

export default AdminUsers;
