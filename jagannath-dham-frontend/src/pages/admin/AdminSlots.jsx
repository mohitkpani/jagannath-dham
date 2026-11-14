
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminSlots.css";

const initialForm = {
    categoryId: "",
    slotDate: "",
    totalCapacity: ""
};

const AdminSlots = () => {
    const [slots, setSlots] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [filterDate, setFilterDate] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const fetchSlots = async () => {
        try {
            const response = await api.get("/darshan-slots");
            setSlots(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load darshan slots.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            const activeCategories = response.data.filter(
                (category) => category.active
            );
            setCategories(activeCategories);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load categories.");
        }
    };

    useEffect(() => {
        fetchSlots();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFilter = async (date) => {
        setFilterDate(date);
        setLoading(true);
        setMessage("");

        try {
            const response = date
                ? await api.get(`/darshan-slots/date?date=${date}`)
                : await api.get("/darshan-slots");

            setSlots(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            setMessage("Failed to filter slots.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            await api.post("/darshan-slots", {
                categoryId: Number(form.categoryId),
                slotDate: form.slotDate,
                totalCapacity: Number(form.totalCapacity)
            });

            setMessage("Darshan slot created successfully!");
            setForm(initialForm);
            setShowForm(false);
            setFilterDate("");
            await fetchSlots();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to create darshan slot."
            );
        } finally {
            setSaving(false);
        }
    };

    const totalCapacity = slots.reduce(
        (sum, slot) => sum + slot.totalCapacity, 0
    );

    const totalBooked = slots.reduce(
        (sum, slot) => sum + slot.bookedCount, 0
    );

    const totalAvailable = slots.reduce(
        (sum, slot) => sum + slot.availableCapacity, 0
    );

    if (loading) {
        return <div className="admin-slots">Loading darshan slots...</div>;
    }

    return (
        <div className="admin-slots">
            <div className="slots-header">
                <div>
                    <h1>Darshan Slots Management</h1>
                    <p>Manage daily darshan capacity and availability.</p>
                </div>

                <button
                    className="add-slot-btn"
                    onClick={() => {
                        setMessage("");
                        setShowForm(!showForm);
                    }}
                >
                    + Create Slot
                </button>
            </div>

            {message && <p className="slot-message">{message}</p>}

            {showForm && (
                <form className="slot-form" onSubmit={handleSubmit}>
                    <h2>Create Darshan Slot</h2>

                    <label>Darshan Category</label>
                    <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.type} - ₹{category.fee}
                            </option>
                        ))}
                    </select>

                    <label>Slot Date</label>
                    <input
                        type="date"
                        name="slotDate"
                        value={form.slotDate}
                        onChange={handleChange}
                        min={new Date().toLocaleDateString("en-CA")}
                        required
                    />

                    <label>Total Capacity</label>
                    <input
                        type="number"
                        name="totalCapacity"
                        value={form.totalCapacity}
                        onChange={handleChange}
                        min="1"
                        placeholder="Enter total capacity"
                        required
                    />

                    <div className="slot-form-actions">
                        <button type="submit" disabled={saving}>
                            {saving ? "Creating..." : "Create Slot"}
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

            <div className="slots-summary">
                <div>
                    <span>Total Slots</span>
                    <strong>{slots.length}</strong>
                </div>
                <div>
                    <span>Total Capacity</span>
                    <strong>{totalCapacity}</strong>
                </div>
                <div>
                    <span>Booked</span>
                    <strong>{totalBooked}</strong>
                </div>
                <div>
                    <span>Available</span>
                    <strong>{totalAvailable}</strong>
                </div>
            </div>

            <div className="slots-filter">
                <label>Filter by date:</label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => handleFilter(e.target.value)}
                />

                {filterDate && (
                    <button onClick={() => handleFilter("")}>
                        Clear Filter
                    </button>
                )}
            </div>

            <div className="slots-table-container">
                <table className="slots-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Total Capacity</th>
                            <th>Booked</th>
                            <th>Available</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {slots.length === 0 ? (
                            <tr>
                                <td colSpan="7">No darshan slots found.</td>
                            </tr>
                        ) : (
                            slots.map((slot) => (
                                <tr key={slot.id}>
                                    <td>{slot.id}</td>
                                    <td>{slot.categoryType}</td>
                                    <td>{slot.slotDate}</td>
                                    <td>{slot.totalCapacity}</td>
                                    <td>{slot.bookedCount}</td>
                                    <td>{slot.availableCapacity}</td>
                                    <td>
                                        <span className={
                                            slot.active
                                                ? "slot-active"
                                                : "slot-inactive"
                                        }>
                                            {slot.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSlots;
