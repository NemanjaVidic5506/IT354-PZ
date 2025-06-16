import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReviewsList from '../components/Review/ReviewsList';
import ReviewForm from '../components/Review/ReviewForm';

// Validation schema for booking
const bookingSchema = Yup.object().shape({
    startDate: Yup.date()
        .min(new Date(), 'Start date cannot be in the past')
        .required('Start date is required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
});

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const response = await fetch(`http://localhost:3000/listings/${id}`);
            if (!response.ok) throw new Error('Failed to fetch listing');
            const data = await response.json();
            setListing(data);
        } catch (err) {
            setError('Error loading listing details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = (startDate, endDate) => {
        if (!startDate || !endDate || !listing) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return nights * listing.price;
    };

    const handleBooking = async (values, { setSubmitting, setFieldError }) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Check for existing reservations
            const reservationsResponse = await fetch('http://localhost:3000/reservations');
            const reservations = await reservationsResponse.json();
            const start = new Date(values.startDate);
            const end = new Date(values.endDate);

            const conflictingReservation = reservations.find(
                (res) =>
                    res.listingId === parseInt(id) &&
                    ((start >= new Date(res.startDate) && start < new Date(res.endDate)) ||
                        (end > new Date(res.startDate) && end <= new Date(res.endDate)))
            );

            if (conflictingReservation) {
                setFieldError('general', 'These dates are not available');
                return;
            }

            // Create new reservation
            const newReservation = {
                listingId: parseInt(id),
                userId: user.id,
                startDate: values.startDate,
                endDate: values.endDate,
                totalPrice: calculateTotalPrice(values.startDate, values.endDate),
                status: 'confirmed',
            };

            const response = await fetch('http://localhost:3000/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReservation),
            });

            if (!response.ok) throw new Error('Failed to create reservation');

            // Redirect to reservations page
            navigate('/my-reservations');
        } catch (err) {
            setFieldError('general', 'Error creating reservation. Please try again.');
            console.error('Booking error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center mt-4">Loading...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;
    if (!listing) return <div className="alert alert-danger mt-4">Listing not found</div>;

    return (
        <div className="container mt-4">
            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Listing Details */}
                <div>
                    <img
                        src={listing.image}
                        alt={listing.title}
                        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <h2 className="mt-4">{listing.title}</h2>
                    <p className="text-primary mb-2">${listing.price} / night</p>
                    <p className="mb-4">{listing.location}</p>
                    <div className="card mb-4">
                        <div className="card-content">
                            <h3>About this place</h3>
                            <p>{listing.description}</p>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                <div>
                                    <strong>Bedrooms</strong>
                                    <p>{listing.bedrooms}</p>
                                </div>
                                <div>
                                    <strong>Bathrooms</strong>
                                    <p>{listing.bathrooms}</p>
                                </div>
                                <div>
                                    <strong>Max Guests</strong>
                                    <p>{listing.maxGuests}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <ReviewsList
                        listingId={parseInt(id)}
                        onReviewSubmitted={() => setShowReviewForm(false)}
                    />

                    {/* Review Form */}
                    {user && !showReviewForm && (
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => setShowReviewForm(true)}
                        >
                            Write a Review
                        </button>
                    )}
                    {showReviewForm && (
                        <div className="mt-4">
                            <ReviewForm
                                listingId={parseInt(id)}
                                onReviewSubmitted={() => setShowReviewForm(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Booking Form */}
                <div>
                    <div className="card">
                        <div className="card-content">
                            <h3>Book this place</h3>
                            <Formik
                                initialValues={{
                                    startDate: '',
                                    endDate: '',
                                }}
                                validationSchema={bookingSchema}
                                onSubmit={handleBooking}
                            >
                                {({ isSubmitting, errors, touched, values }) => (
                                    <Form>
                                        {errors.general && (
                                            <div className="alert alert-danger">{errors.general}</div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="startDate">Check-in</label>
                                            <Field
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                className={`form-control ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <ErrorMessage
                                                name="startDate"
                                                component="div"
                                                className="invalid-feedback"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="endDate">Check-out</label>
                                            <Field
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
                                                min={values.startDate || new Date().toISOString().split('T')[0]}
                                            />
                                            <ErrorMessage
                                                name="endDate"
                                                component="div"
                                                className="invalid-feedback"
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <h4>Total Price</h4>
                                            <p className="text-primary" style={{ fontSize: '1.5rem' }}>
                                                ${calculateTotalPrice(values.startDate, values.endDate)}
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 mt-4"
                                            disabled={!user || isSubmitting}
                                        >
                                            {!user ? 'Login to Book' : isSubmitting ? 'Booking...' : 'Book Now'}
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 