
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminFestivals.css";

const initialForm = {
    name: "",
    month: "",
    location: "",
    description: "",
    significance: "",
    imageUrl: ""
};

const AdminFestivals = () => {
    const [festivals, setFestivals] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const fetchFestivals = async () => {
        try {
            const response = await api.get("/festivals");
            setFestivals(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error(error);
            setMessage("Failed to load festivals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFestivals();
    }, []);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(initialForm);
        setSelectedFestival(null);
        setShowForm(true);
        setMessage("");
    };

    const handleEdit = (festival) => {
        setEditingId(festival.id);

        setForm({
            name: festival.name || "",
            month: festival.month || "",
            location: festival.location || "",
            description: festival.description || "",
            significance: festival.significance || "",
            imageUrl: festival.imageUrl || ""
        });

        setSelectedFestival(null);
        setShowForm(true);
        setMessage("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            if (editingId) {
                await api.put(`/festivals/${editingId}`, form);
                setMessage("Festival updated successfully.");
            } else {
                await api.post("/festivals", form);
                setMessage("Festival created successfully.");
            }

            closeForm();
            await fetchFestivals();
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data?.message ||
                "Unable to save festival."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this festival?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/festivals/${id}`);

            setSelectedFestival(null);
            setMessage("Festival deleted successfully.");

            await fetchFestivals();
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data?.message ||
                "Unable to delete festival."
            );
        }
    };

    const filteredFestivals = festivals.filter((festival) => {
        const query = search.toLowerCase();

        return (
            festival.name?.toLowerCase().includes(query) ||
            festival.month?.toLowerCase().includes(query) ||
            festival.location?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="admin-festivals">

            {/* Header */}
            <div className="festivals-header">
                <div>
                    <h1>Festivals Management</h1>
                    <p>Manage festivals celebrated across Odisha.</p>
                </div>

                <button
                    className="festival-add-btn"
                    onClick={openCreateForm}
                >
                    + Add Festival
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className="festival-message">
                    {message}
                </div>
            )}

            {/* Summary */}
            <div className="festival-summary">
                <div>
                    <span>Total Festivals</span>
                    <strong>{festivals.length}</strong>
                </div>

                <div>
                    <span>Locations</span>
                    <strong>
                        {new Set(
                            festivals.map((f) => f.location).filter(Boolean)
                        ).size}
                    </strong>
                </div>

                <div>
                    <span>Months Covered</span>
                    <strong>
                        {new Set(
                            festivals.map((f) => f.month).filter(Boolean)
                        ).size}
                    </strong>
                </div>
            </div>

            {/* Search */}
            <div className="festival-search">
                <input
                    type="text"
                    placeholder="Search by festival, month or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <form
                    className="festival-form"
                    onSubmit={handleSubmit}
                >
                    <h2>
                        {editingId ? "Edit Festival" : "Add Festival"}
                    </h2>

                    <label>Festival Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={150}
                        required
                    />

                    <label>Month *</label>
                    <input
                        type="text"
                        name="month"
                        value={form.month}
                        onChange={handleChange}
                        maxLength={30}
                        placeholder="Example: October"
                        required
                    />

                    <label>Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        required
                    />

                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                    />

                    <label>Significance</label>
                    <textarea
                        name="significance"
                        value={form.significance}
                        onChange={handleChange}
                        rows={4}
                    />

                    <label>Festival Image URL</label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        maxLength={500}
                        placeholder="https://..."
                    />

                    {form.imageUrl && (
                        <img
                            className="festival-form-preview"
                            src={form.imageUrl}
                            alt="Festival preview"
                        />
                    )}

                    <div className="festival-form-actions">
                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Festival"
                                    : "Create Festival"}
                        </button>

                        <button
                            type="button"
                            onClick={closeForm}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Festival Cards */}
            {loading ? (
                <p>Loading festivals...</p>
            ) : filteredFestivals.length === 0 ? (
                <p>No festivals found.</p>
            ) : (
                <div className="festival-card-grid">
                    {filteredFestivals.map((festival) => (
                        <div
                            className="admin-festival-card"
                            key={festival.id}
                        >
                            {festival.imageUrl ? (
                                <img
                                    src={festival.imageUrl}
                                    alt={festival.name}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="festival-image-placeholder">
                                    No Image
                                </div>
                            )}

                            <div className="admin-festival-info">
                                <h3>{festival.name}</h3>

                                <p>
                                    <strong>Month:</strong> {festival.month}
                                </p>

                                <p>
                                    <strong>Location:</strong> {festival.location}
                                </p>

                                <p className="festival-short-description">
                                    {festival.description || "No description"}
                                </p>

                                <div className="festival-card-actions">
                                    <button
                                        onClick={() =>
                                            setSelectedFestival(festival)
                                        }
                                    >
                                        View Details
                                    </button>

                                    <button
                                        onClick={() => handleEdit(festival)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedFestival && (
                <div
                    className="festival-modal-overlay"
                    onClick={() => setSelectedFestival(null)}
                >
                    <div
                        className="festival-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="festival-modal-close"
                            onClick={() => setSelectedFestival(null)}
                        >
                            ×
                        </button>

                        {selectedFestival.imageUrl && (
                            <img
                                src={selectedFestival.imageUrl}
                                alt={selectedFestival.name}
                            />
                        )}

                        <h2>{selectedFestival.name}</h2>

                        <p>
                            <strong>Month:</strong> {selectedFestival.month}
                        </p>

                        <p>
                            <strong>Location:</strong> {selectedFestival.location}
                        </p>

                        <p>
                            <strong>Description:</strong>{" "}
                            {selectedFestival.description || "N/A"}
                        </p>

                        <p>
                            <strong>Significance:</strong>{" "}
                            {selectedFestival.significance || "N/A"}
                        </p>

                        <div className="festival-modal-actions">
                            <button
                                onClick={() =>
                                    handleEdit(selectedFestival)
                                }
                            >
                                Edit Festival
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(selectedFestival.id)
                                }
                            >
                                Delete Festival
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminFestivals;
