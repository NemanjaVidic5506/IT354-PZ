import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema
const registerSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .required('Username is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

export default function Register() {
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            // Check if username already exists
            const response = await fetch('http://localhost:3000/users');
            const users = await response.json();
            const userExists = users.some((user) => user.username === values.username);

            if (userExists) {
                setFieldError('username', 'Username already exists');
                return;
            }

            // Create new user
            const newUser = {
                username: values.username,
                password: values.password,
                isAdmin: false // Default to non-admin for new registrations
            };

            const createResponse = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create user');
            }

            // Redirect to login page after successful registration
            navigate('/login');
        } catch (err) {
            setFieldError('general', 'Error creating account. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-4">
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-center mb-4">Register</h2>
                <Formik
                    initialValues={{
                        username: '',
                        password: '',
                        confirmPassword: '',
                    }}
                    validationSchema={registerSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            {errors.general && (
                                <div className="alert alert-danger" role="alert">
                                    {errors.general}
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <Field
                                    type="text"
                                    id="username"
                                    name="username"
                                    className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage
                                    name="username"
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <Field
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                                />
                                <ErrorMessage
                                    name="confirmPassword"
                                    component="div"
                                    className="invalid-feedback"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </button>
                        </Form>
                    )}
                </Formik>
                <p className="text-center mt-3">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
} 