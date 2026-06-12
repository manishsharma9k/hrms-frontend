import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="auth-wrapper"><p>Loading...</p></div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    if (roleRequired && user.role !== roleRequired) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />;
    }

    return children;
};

export default ProtectedRoute;
