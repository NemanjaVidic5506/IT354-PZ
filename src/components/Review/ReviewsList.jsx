import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const responseSchema = Yup.object().shape({
    response: Yup.string()
        .min(10, 'Response must be at least 10 characters')
        .max(500, 'Response must be at most 500 characters')
        .required('Response is required'),
});

export default function ReviewsList({ listingId, onReviewSubmitted }) {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        fetchReviews();
        fetchUsers();
    }, [listingId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:3000/reviews?listingId=${listingId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError('Error loading reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            const usersMap = data.reduce((acc, user) => {
                acc[user.id] = user;
                return acc;
            }, {});
            setUsers(usersMap);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleResponse = async (reviewId, values, { setSubmitting, resetForm }) => {
        try {
            const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerResponse: values.response,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit response');

            // Update the reviews list
            setReviews(reviews.map(review =>
                review.id === reviewId
                    ? { ...review, ownerResponse: values.response }
                    : review
            ));

            resetForm();
        } catch (err) {
            console.error('Error submitting response:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center mt-4">Loading reviews...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;
    if (reviews.length === 0) return <div className="text-center mt-4">No reviews yet</div>;

    return (
        <div className="mt-4">
            <h3>Reviews</h3>
            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="card">
                        <div className="card-content">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4>{review.title}</h4>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="text-warning">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </div>
                                        <span className="text-muted">
                                            by {users[review.userId]?.username || 'Unknown User'}
                                        </span>
                                        <span className="text-muted">
                                            on {new Date(review.date).toLocaleDateString()}
                                        </span>
                                        {review.isVerified && (
                                            <span className="badge bg-success">Verified Stay</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3">{review.comment}</p>

                            {/* Pros and Cons */}
                            {(review.pros?.length > 0 || review.cons?.length > 0) && (
                                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    {review.pros?.length > 0 && (
                                        <div>
                                            <h5>Positive Aspects</h5>
                                            <ul>
                                                {review.pros.map((pro, index) => (
                                                    <li key={index}>{pro}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {review.cons?.length > 0 && (
                                        <div>
                                            <h5>Negative Aspects</h5>
                                            <ul>
                                                {review.cons.map((con, index) => (
                                                    <li key={index}>{con}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Owner Response */}
                            {review.ownerResponse ? (
                                <div className="mt-3 p-3 bg-light rounded">
                                    <h5>Owner's Response</h5>
                                    <p>{review.ownerResponse}</p>
                                </div>
                            ) : isAdmin && (
                                <div className="mt-3">
                                    <Formik
                                        initialValues={{ response: '' }}
                                        validationSchema={responseSchema}
                                        onSubmit={(values, formikHelpers) =>
                                            handleResponse(review.id, values, formikHelpers)
                                        }
                                    >
                                        {({ isSubmitting }) => (
                                            <Form>
                                                <div className="form-group">
                                                    <Field
                                                        as="textarea"
                                                        name="response"
                                                        className="form-control"
                                                        placeholder="Write a response to this review..."
                                                        rows="3"
                                                    />
                                                    <ErrorMessage
                                                        name="response"
                                                        component="div"
                                                        className="invalid-feedback"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary mt-2"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Submitting...' : 'Submit Response'}
                                                </button>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 