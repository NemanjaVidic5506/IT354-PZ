import { useState, useEffect } from 'react';
import { ListingCard } from '../components/Listing/ListingCard';

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('http://localhost:3000/listings');
            if (!response.ok) throw new Error('Failed to fetch listings');
            const data = await response.json();
            setListings(data);
        } catch (err) {
            setError('Error loading listings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = listings.filter((listing) => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = !locationFilter || listing.location.toLowerCase() === locationFilter.toLowerCase();
        const matchesPrice = !priceFilter || listing.price <= parseInt(priceFilter);
        return matchesSearch && matchesLocation && matchesPrice;
    });

    const locations = [...new Set(listings.map((listing) => listing.location))];

    if (loading) return <div className="text-center mt-4">Loading...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Available Listings</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-content">
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="form-group">
                            <label htmlFor="search">Search</label>
                            <input
                                type="text"
                                id="search"
                                className="form-control"
                                placeholder="Search by title or description"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <select
                                id="location"
                                className="form-control"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Max Price per Night</label>
                            <input
                                type="number"
                                id="price"
                                className="form-control"
                                placeholder="Enter max price"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <p className="mb-4">
                Found {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
            </p>

            {/* Listings grid */}
            {filteredListings.length > 0 ? (
                <div className="grid">
                    {filteredListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="alert alert-info">No listings found matching your criteria.</div>
            )}
        </div>
    );
} 