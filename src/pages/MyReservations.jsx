import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [listings, setListings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchReservations();
        }
    }, [user]);

    const fetchReservations = async () => {
        try {
            // Fetch user's reservations
            const reservationsResponse = await fetch(
                `http://localhost:3000/reservations?userId=${user.id}`
            );
            if (!reservationsResponse.ok) throw new Error('Failed to fetch reservations');
            const reservationsData = await reservationsResponse.json();

            // Fetch all listings to get details
            const listingsResponse = await fetch('http://localhost:3000/listings');
            if (!listingsResponse.ok) throw new Error('Failed to fetch listings');
            const listingsData = await listingsResponse.json();

            // Create a map of listings for easy lookup
            const listingsMap = listingsData.reduce((acc, listing) => {
                acc[listing.id] = listing;
                return acc;
            }, {});

            setReservations(reservationsData);
            setListings(listingsMap);
        } catch (err) {
            setError('Error loading reservations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/reservations/${reservationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to cancel reservation');

            // Update local state
            setReservations((prev) =>
                prev.filter((reservation) => reservation.id !== reservationId)
            );
        } catch (err) {
            setError('Error canceling reservation');
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) return <div className="text-center mt-4">Loading...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;
    if (!user) return <div className="alert alert-danger mt-4">Please login to view your reservations</div>;

    return (
        <div className="container mt-4">
            <h2>My Reservations</h2>
            {reservations.length === 0 ? (
                <div className="alert alert-info mt-4">
                    You don't have any reservations yet.{' '}
                    <Link to="/listings" className="text-primary">
                        Browse listings
                    </Link>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {reservations.map((reservation) => {
                        const listing = listings[reservation.listingId];
                        if (!listing) return null;

                        return (
                            <div key={reservation.id} className="card">
                                <img
                                    src={listing.image}
                                    alt={listing.title}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-content">
                                    <h3>{listing.title}</h3>
                                    <p className="text-primary">${reservation.totalPrice} total</p>
                                    <div className="mb-2">
                                        <strong>Check-in:</strong> {formatDate(reservation.startDate)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Check-out:</strong> {formatDate(reservation.endDate)}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Status:</strong>{' '}
                                        <span
                                            className={
                                                reservation.status === 'confirmed'
                                                    ? 'text-success'
                                                    : 'text-danger'
                                            }
                                        >
                                            {reservation.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Link
                                            to={`/listings/${listing.id}`}
                                            className="btn btn-primary"
                                        >
                                            View Listing
                                        </Link>
                                        {reservation.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                className="btn btn-danger"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
} 