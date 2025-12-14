import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute - Bảo vệ route dựa trên role
 * @param {*} param0 
 * @returns 
 */
const ProtectedRoute = ({ 
  currentUser, 
  requiredRoles, 
  children, 
  redirectTo = '/login' 
}) => {
  
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    // Redirect dựa vào role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser.role === 'can_bo') {
      return <Navigate to="/officer/dashboard" replace />;
    } else if (currentUser.role === 'nguoi_dan') {
      return <Navigate to="/citizen/home" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
