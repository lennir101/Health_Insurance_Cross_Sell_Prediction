import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext';

const UserMenu: React.FC = () => {
    const {isLoggedIn, user, logout} = useAuth();
    const navigate = useNavigate();

    // 處理登出
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoggedIn) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    歡迎, {user?.username || '用戶'}
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    登出
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                登錄
            </Link>
            <Link
                to="/register"
                className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
                註冊
            </Link>
        </div>
    );
};

export default UserMenu; 