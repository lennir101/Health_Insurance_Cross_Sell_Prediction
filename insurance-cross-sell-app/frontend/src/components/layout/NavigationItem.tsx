import React from 'react';
import {Link, useLocation} from 'react-router-dom';

interface NavigationItemProps {
    to: string;
    label: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({to, label}) => {
    const location = useLocation();

    // 判斷當前路徑是否為活動狀態
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
        >
            {label}
        </Link>
    );
};

export default NavigationItem; 