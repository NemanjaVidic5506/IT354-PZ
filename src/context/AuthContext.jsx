import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Attempting login with:', { username, password });
            const response = await fetch('http://localhost:3000/users');
            const users = await response.json();
            console.log('Available users:', users);
            const foundUser = users.find(
                (u) => {
                    const match = u.username === username && u.password === password;
                    console.log('Checking user:', u.username, 'Match:', match);
                    return match;
                }
            );
            console.log('Found user:', foundUser);

            if (foundUser) {
                const userData = { ...foundUser, password: undefined };
                console.log('Setting user data:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            }
            console.log('No matching user found');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAdmin = () => {
        return user?.isAdmin === true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 