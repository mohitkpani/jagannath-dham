
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminCategories.css";

const initialForm = {
    type: "NORMAL",
    description: "",
    fee: ""
};

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error(error);
            setMessage("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Automatically hide messages after 3 seconds
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
        setMessage("");
        setShowForm(true);
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setForm({
            type: category.type,
            description: category.description || "",
            fee: category.fee
        });
        setMessage("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            if (editingId) {
                await api.put(`/categories/${editingId}`, form);
                setMessage("Category updated successfully.");
            } else {
                await api.post("/categories", form);
                setMessage("Category created successfully.");
            }

            setForm(initialForm);
            setEditingId(null);
            setShowForm(false);

            await fetchCategories();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (category) => {
        const action = category.active
            ? "deactivate"
            : "activate";

        if (!window.confirm(
            `Are you sure you want to ${action} this category?`
        )) {
            return;
        }

        try {
            await api.patch(
                `/categories/${category.id}/${action}`
            );

            setMessage(`Category ${action}d successfully.`);
            await fetchCategories();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to update category status."
            );
        }
    };

    if (loading) {
        return (
            <div className="admin-categories">
                Loading categories...
            </div>
        );
    }

    return (
        <div className="admin-categories">

            <div className="categories-header">
                <div>
                    <h1>Darshan Categories</h1>
                    <p>
                        Manage VIP, Normal and Free darshan categories.
                    </p>
                </div>

                <button
                    className="category-add-btn"
                    onClick={openCreateForm}
                >
                    + Add Category
                </button>
            </div>

            {message && (
                <p className="category-message">
                    {message}
                </p>
            )}

            {showForm && (
                <form
                    className="category-form"
                    onSubmit={handleSubmit}
                >
                    <h2>
                        {editingId
                            ? "Edit Category"
                            : "Create Category"}
                    </h2>

                    <label>Category Type</label>

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="VIP">VIP</option>
                        <option value="NORMAL">NORMAL</option>
                        <option value="FREE">FREE</option>
                    </select>

                    <label>Description</label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        maxLength={500}
                        placeholder="Enter category description"
                    />

                    <label>Fee (₹)</label>

                    <input
                        type="number"
                        name="fee"
                        value={form.fee}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />

                    <div className="category-form-actions">
                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Category"
                                    : "Create Category"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="category-summary">

                <div>
                    <span>Total Categories</span>
                    <strong>{categories.length}</strong>
                </div>

                <div>
                    <span>Active</span>
                    <strong>
                        {categories.filter(
                            (c) => c.active
                        ).length}
                    </strong>
                </div>

                <div>
                    <span>Inactive</span>
                    <strong>
                        {categories.filter(
                            (c) => !c.active
                        ).length}
                    </strong>
                </div>

            </div>

            <div className="category-list">

                {categories.length === 0 ? (
                    <p>No categories found.</p>
                ) : (
                    categories.map((category) => (
                        <div
                            className="category-card"
                            key={category.id}
                        >
                            <div className="category-card-info">

                                <h3>{category.type}</h3>

                                <p>
                                    {category.description ||
                                        "No description"}
                                </p>

                                <strong>
                                    ₹{category.fee}
                                </strong>

                                <span
                                    className={
                                        category.active
                                            ? "active-status"
                                            : "inactive-status"
                                    }
                                >
                                    {category.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            </div>

                            <div className="category-card-actions">

                                <button
                                    onClick={() =>
                                        handleEdit(category)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleStatus(category)
                                    }
                                >
                                    {category.active
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>

                            </div>
                        </div>
                    ))
                )}

            </div>

        </div>
    );
};

export default AdminCategories;
