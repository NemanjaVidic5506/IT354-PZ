import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingListing, setEditingListing] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        maxGuests: '',
        image: ''
    });

    // Fetch listings
    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('http://localhost:3000/listings');
            if (!response.ok) throw new Error('Failed to fetch listings');
            const data = await response.json();
            setListings(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = editingListing
                ? `http://localhost:3000/listings/${editingListing.id}`
                : 'http://localhost:3000/listings';

            const method = editingListing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    bedrooms: Number(formData.bedrooms),
                    bathrooms: Number(formData.bathrooms),
                    maxGuests: Number(formData.maxGuests)
                }),
            });

            if (!response.ok) throw new Error('Failed to save listing');

            await fetchListings();
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle listing deletion
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const response = await fetch(`http://localhost:3000/listings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete listing');

            await fetchListings();
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle edit button click
    const handleEdit = (listing) => {
        setEditingListing(listing);
        setFormData({
            title: listing.title,
            description: listing.description,
            location: listing.location,
            price: listing.price.toString(),
            bedrooms: listing.bedrooms.toString(),
            bathrooms: listing.bathrooms.toString(),
            maxGuests: listing.maxGuests.toString(),
            image: listing.image
        });
    };

    // Reset form
    const resetForm = () => {
        setEditingListing(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            price: '',
            bedrooms: '',
            bathrooms: '',
            maxGuests: '',
            image: ''
        });
    };

    if (loading && !listings.length) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <h1 className="text-center mb-4">Admin Dashboard</h1>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Add/Edit Listing Form */}
            <div className="dashboard-form mb-4">
                <h2>{editingListing ? 'Edit Listing' : 'Add New Listing'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-control"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                className="form-control"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price per night</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                className="form-control"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Image URL</label>
                            <input
                                type="url"
                                id="image"
                                name="image"
                                className="form-control"
                                value={formData.image}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bedrooms">Bedrooms</label>
                            <input
                                type="number"
                                id="bedrooms"
                                name="bedrooms"
                                className="form-control"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bathrooms">Bathrooms</label>
                            <input
                                type="number"
                                id="bathrooms"
                                name="bathrooms"
                                className="form-control"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxGuests">Max Guests</label>
                            <input
                                type="number"
                                id="maxGuests"
                                name="maxGuests"
                                className="form-control"
                                value={formData.maxGuests}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary">
                            {editingListing ? 'Update Listing' : 'Add Listing'}
                        </button>
                        {editingListing && (
                            <button type="button" className="btn btn-outline" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Listings Table */}
            <div className="dashboard-table">
                <h2>Manage Listings</h2>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Details</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(listing => (
                                <tr key={listing.id}>
                                    <td>
                                        <img
                                            src={listing.image}
                                            alt={listing.title}
                                            style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td>{listing.title}</td>
                                    <td>{listing.location}</td>
                                    <td>${listing.price}/night</td>
                                    <td>
                                        {listing.bedrooms} beds • {listing.bathrooms} baths • {listing.maxGuests} guests
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleEdit(listing)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(listing.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 