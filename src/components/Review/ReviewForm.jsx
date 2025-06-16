import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const reviewSchema = Yup.object().shape({
    rating: Yup.number()
        .min(1, 'Rating is required')
        .max(5, 'Rating must be between 1 and 5')
        .required('Rating is required'),
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must be at most 100 characters')
        .required('Title is required'),
    comment: Yup.string()
        .min(20, 'Comment must be at least 20 characters')
        .max(1000, 'Comment must be at most 1000 characters')
        .required('Comment is required'),
    pros: Yup.array()
        .of(Yup.string())
        .min(1, 'Please add at least one positive aspect')
        .max(5, 'Maximum 5 positive aspects allowed'),
    cons: Yup.array()
        .of(Yup.string())
        .max(5, 'Maximum 5 negative aspects allowed'),
});

export default function ReviewForm({ listingId, onReviewSubmitted }) {
    const { user } = useAuth();

    const handleSubmit = async (values, { setSubmitting, setFieldError, resetForm }) => {
        try {
            // Check if user has stayed at this listing
            const reservationsResponse = await fetch('http://localhost:3000/reservations');
            const reservations = await reservationsResponse.json();

            const hasStayed = reservations.some(
                (res) =>
                    res.listingId === listingId &&
                    res.userId === user.id &&
                    new Date(res.endDate) < new Date() // Stay has ended
            );

            if (!hasStayed) {
                setFieldError('general', 'You can only review listings you have stayed at');
                return;
            }

            // Check if user has already reviewed this listing
            const reviewsResponse = await fetch('http://localhost:3000/reviews');
            const reviews = await reviewsResponse.json();

            const hasReviewed = reviews.some(
                (review) => review.listingId === listingId && review.userId === user.id
            );

            if (hasReviewed) {
                setFieldError('general', 'You have already reviewed this listing');
                return;
            }

            // Create new review
            const newReview = {
                listingId,
                userId: user.id,
                ...values,
                date: new Date().toISOString().split('T')[0],
                isVerified: true,
                ownerResponse: null
            };

            const response = await fetch('http://localhost:3000/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReview),
            });

            if (!response.ok) throw new Error('Failed to submit review');

            resetForm();
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            setFieldError('general', 'Error submitting review. Please try again.');
            console.error('Review submission error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card">
            <div className="card-content">
                <h3>Write a Review</h3>
                <Formik
                    initialValues={{
                        rating: 0,
                        title: '',
                        comment: '',
                        pros: [''],
                        cons: [''],
                    }}
                    validationSchema={reviewSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                        <Form>
                            {errors.general && (
                                <div className="alert alert-danger">{errors.general}</div>
                            )}

                            {/* Rating */}
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="d-flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`btn ${values.rating >= star ? 'btn-warning' : 'btn-outline-warning'}`}
                                            onClick={() => setFieldValue('rating', star)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <ErrorMessage
                                    name="rating"
                                    component="div"
                                    className="invalid-feedback d-block"
                                />
                            </div>

                            {/* Title */}
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <Field
                                    type="text"
                                    id="title"
                                    name="title"
                                    className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage
                                    name="title"
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>

                            {/* Comment */}
                            <div className="form-group">
                                <label htmlFor="comment">Comment</label>
                                <Field
                                    as="textarea"
                                    id="comment"
                                    name="comment"
                                    rows="4"
                                    className={`form-control ${touched.comment && errors.comment ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage
                                    name="comment"
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>

                            {/* Pros */}
                            <div className="form-group">
                                <label>Positive Aspects</label>
                                {values.pros.map((_, index) => (
                                    <div key={index} className="mb-2">
                                        <Field
                                            type="text"
                                            name={`pros.${index}`}
                                            className="form-control"
                                            placeholder={`Positive aspect ${index + 1}`}
                                        />
                                    </div>
                                ))}
                                {values.pros.length < 5 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setFieldValue('pros', [...values.pros, ''])}
                                    >
                                        Add Positive Aspect
                                    </button>
                                )}
                                <ErrorMessage
                                    name="pros"
                                    component="div"
                                    className="invalid-feedback d-block"
                                />
                            </div>

                            {/* Cons */}
                            <div className="form-group">
                                <label>Negative Aspects</label>
                                {values.cons.map((_, index) => (
                                    <div key={index} className="mb-2">
                                        <Field
                                            type="text"
                                            name={`cons.${index}`}
                                            className="form-control"
                                            placeholder={`Negative aspect ${index + 1}`}
                                        />
                                    </div>
                                ))}
                                {values.cons.length < 5 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setFieldValue('cons', [...values.cons, ''])}
                                    >
                                        Add Negative Aspect
                                    </button>
                                )}
                                <ErrorMessage
                                    name="cons"
                                    component="div"
                                    className="invalid-feedback d-block"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
} 