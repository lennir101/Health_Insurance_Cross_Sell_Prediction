import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 如果正在加載，顯示加載狀態
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果需要管理員權限但用戶不是管理員
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // 如果未登錄，重定向到登錄頁面
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果已登錄且符合權限要求，顯示受保護的內容
  return <>{children}</>;
};

export default ProtectedRoute; 