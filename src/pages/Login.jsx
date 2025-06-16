import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

// Validation schema
const loginSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required'),
    password: Yup.string()
        .required('Password is required'),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const success = await login(values.username, values.password);

            if (success) {
                navigate('/');
            } else {
                setFieldError('general', 'Invalid username or password');
            }
        } catch (err) {
            setFieldError('general', 'Error logging in. Please try again.');
            console.error('Login error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-4">
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-center mb-4">Login</h2>
                <Formik
                    initialValues={{
                        username: '',
                        password: '',
                    }}
                    validationSchema={loginSchema}
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
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </button>
                        </Form>
                    )}
                </Formik>
                <p className="text-center mt-3">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
} 