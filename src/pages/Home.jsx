import { useState, useEffect } from 'react';
import { ListingCard } from '../components/Listing/ListingCard';

export default function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('http://localhost:3000/listings');
                if (!response.ok) {
                    throw new Error('Failed to fetch listings');
                }
                const data = await response.json();
                setListings(data);
            } catch (err) {
                setError('Error loading listings. Please try again later.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    if (loading) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Welcome to VidaBNB</h1>
            <p className="text-center mb-4">
                Find your perfect stay from our selection of amazing properties
            </p>
            <div className="grid">
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </div>
    );
} 