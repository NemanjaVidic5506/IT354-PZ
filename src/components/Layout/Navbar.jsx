import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={`navbar ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    VidaBNB
                </Link>

                <button className="navbar-toggle" onClick={toggleMenu}>
                    ☰
                </button>

                <div className="navbar-menu">
                    <Link to="/" className="navbar-item">
                        Home
                    </Link>
                    <Link to="/listings" className="navbar-item">
                        Listings
                    </Link>
                    {user && (
                        <>
                            {isAdmin() && (
                                <Link to="/dashboard" className="navbar-item">
                                    Dashboard
                                </Link>
                            )}
                            <Link to="/my-reservations" className="navbar-item">
                                My Reservations
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-end">
                    {user ? (
                        <>
                            <span className="navbar-user">Welcome, {user.username}</span>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}; 