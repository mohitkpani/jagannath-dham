
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminDestinations.css";

const initialForm = {
    name: "",
    slug: "",
    district: "",
    shortDescription: "",
    fullDescription: "",
    famousFor: "",
    bestSeason: "",
    imageUrl: "",
    published: false,
};

function AdminDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => setMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [message]);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const response = await api.get("/destinations");
            setDestinations(response.data);
        } catch (error) {
            console.error("Failed to load destinations:", error);
            setMessage("Failed to load destinations.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openAddForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(true);
        setSelectedDestination(null);
    };

    const handleEdit = (destination) => {
        setForm({
            name: destination.name || "",
            slug: destination.slug || "",
            district: destination.district || "",
            shortDescription: destination.shortDescription || "",
            fullDescription: destination.fullDescription || "",
            famousFor: destination.famousFor || "",
            bestSeason: destination.bestSeason || "",
            imageUrl: destination.imageUrl || "",
            published: Boolean(destination.published),
        });

        setEditingId(destination.id);
        setShowForm(true);
        setSelectedDestination(null);
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

            if (editingId) {
                await api.put(`/destinations/${editingId}`, form);
                setMessage("Destination updated successfully.");
            } else {
                await api.post("/destinations", form);
                setMessage("Destination created successfully.");
            }

            closeForm();
            await fetchDestinations();
        } catch (error) {
            console.error("Failed to save destination:", error);
            setMessage(
                error.response?.data?.message ||
                "Failed to save destination."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (destination) => {
        try {
            const newPublishedStatus = !destination.published;

            await api.patch(`/destinations/${destination.id}`, {
                published: newPublishedStatus,
            });

            setMessage(
                newPublishedStatus
                    ? "Destination published successfully."
                    : "Destination unpublished successfully."
            );

            await fetchDestinations();
        } catch (error) {
            console.error("Failed to update publish status:", error);
            setMessage("Failed to update destination status.");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this destination?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/destinations/${id}`);
            setSelectedDestination(null);
            setMessage("Destination deleted successfully.");
            await fetchDestinations();
        } catch (error) {
            console.error("Failed to delete destination:", error);
            setMessage("Failed to delete destination.");
        }
    };

    const filteredDestinations = destinations.filter((destination) => {
        const query = search.toLowerCase();

        return (
            destination.name?.toLowerCase().includes(query) ||
            destination.district?.toLowerCase().includes(query)
        );
    });

    const publishedCount = destinations.filter(
        (destination) => destination.published
    ).length;

    const unpublishedCount = destinations.length - publishedCount;

    return (
        <div className="admin-destinations">

            {/* Header */}
            <div className="destinations-header">
                <div>
                    <h1>Destinations Management</h1>
                    <p>Manage Odisha tourist destinations.</p>
                </div>

                <button
                    className="destination-add-btn"
                    onClick={openAddForm}
                >
                    + Add Destination
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className="destination-message">
                    {message}
                </div>
            )}

            {/* Summary */}
            <div className="destination-summary">
                <div>
                    <span>Total Destinations</span>
                    <strong>{destinations.length}</strong>
                </div>

                <div>
                    <span>Published</span>
                    <strong>{publishedCount}</strong>
                </div>

                <div>
                    <span>Unpublished</span>
                    <strong>{unpublishedCount}</strong>
                </div>
            </div>

            {/* Search */}
            <div className="destination-search">
                <input
                    type="text"
                    placeholder="Search destination or district..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Add / Edit Form - moved below summary and search */}
            {showForm && (
                <form
                    className="destination-form"
                    onSubmit={handleSubmit}
                >
                    <h2>
                        {editingId ? "Edit Destination" : "Add Destination"}
                    </h2>

                    <label>Destination Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Slug *</label>
                    <input
                        type="text"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        required
                    />

                    <label>District *</label>
                    <input
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        required
                    />

                    <label>Short Description *</label>
                    <textarea
                        name="shortDescription"
                        value={form.shortDescription}
                        onChange={handleChange}
                        required
                    />

                    <label>Full Description</label>
                    <textarea
                        name="fullDescription"
                        value={form.fullDescription}
                        onChange={handleChange}
                    />

                    <label>Famous For</label>
                    <input
                        type="text"
                        name="famousFor"
                        value={form.famousFor}
                        onChange={handleChange}
                    />

                    <label>Best Season</label>
                    <input
                        type="text"
                        name="bestSeason"
                        value={form.bestSeason}
                        onChange={handleChange}
                    />

                    <label>Image URL *</label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        required
                    />

                    <label className="destination-checkbox">
                        <input
                            type="checkbox"
                            name="published"
                            checked={form.published}
                            onChange={handleChange}
                        />
                        Publish destination
                    </label>

                    <div className="destination-form-actions">
                        <button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Destination"
                                    : "Add Destination"}
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

            {/* Destination Cards */}
            {loading ? (
                <p>Loading destinations...</p>
            ) : filteredDestinations.length === 0 ? (
                <p>No destinations found.</p>
            ) : (
                <div className="destination-card-grid">
                    {filteredDestinations.map((destination) => (
                        <div
                            className="admin-destination-card"
                            key={destination.id}
                        >
                            <img
                                src={destination.imageUrl}
                                alt={destination.name}
                                onError={(e) => {
                                    e.currentTarget.style.visibility = "hidden";
                                }}
                            />

                            <div className="admin-destination-info">

                                <div className="destination-card-title">
                                    <h3>{destination.name}</h3>

                                    <span
                                        className={
                                            destination.published
                                                ? "destination-published"
                                                : "destination-unpublished"
                                        }
                                    >
                                        {destination.published
                                            ? "Published"
                                            : "Unpublished"}
                                    </span>
                                </div>

                                <p>{destination.district}</p>

                                <p className="destination-short-description">
                                    {destination.shortDescription}
                                </p>

                                <div className="destination-card-actions">
                                    <button
                                        onClick={() =>
                                            setSelectedDestination(destination)
                                        }
                                    >
                                        View Details
                                    </button>

                                    <button
                                        onClick={() => handleEdit(destination)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handlePublish(destination)
                                        }
                                    >
                                        {destination.published
                                            ? "Unpublish"
                                            : "Publish"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedDestination && (
                <div
                    className="destination-modal-overlay"
                    onClick={() => setSelectedDestination(null)}
                >
                    <div
                        className="destination-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="destination-modal-close"
                            onClick={() => setSelectedDestination(null)}
                        >
                            ×
                        </button>

                        <img
                            src={selectedDestination.imageUrl}
                            alt={selectedDestination.name}
                        />

                        <h2>{selectedDestination.name}</h2>

                        <p>
                            <strong>District:</strong>{" "}
                            {selectedDestination.district}
                        </p>

                        <p>
                            <strong>Slug:</strong>{" "}
                            {selectedDestination.slug}
                        </p>

                        <p>
                            <strong>Short Description:</strong>{" "}
                            {selectedDestination.shortDescription}
                        </p>

                        <p>
                            <strong>Full Description:</strong>{" "}
                            {selectedDestination.fullDescription || "N/A"}
                        </p>

                        <p>
                            <strong>Famous For:</strong>{" "}
                            {selectedDestination.famousFor || "N/A"}
                        </p>

                        <p>
                            <strong>Best Season:</strong>{" "}
                            {selectedDestination.bestSeason || "N/A"}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {selectedDestination.published
                                ? "Published"
                                : "Unpublished"}
                        </p>

                        <div className="destination-modal-actions">
                            <button
                                onClick={() => handleEdit(selectedDestination)}
                            >
                                Edit Destination
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(selectedDestination.id)
                                }
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDestinations;
