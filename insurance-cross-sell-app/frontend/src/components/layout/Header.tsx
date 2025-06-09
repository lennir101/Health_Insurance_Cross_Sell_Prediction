import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext';
import UserMenu from './UserMenu';
import {themeColors} from '@/lib/themes';
import {ModeToggle} from '@/components/ui/mode-toggle';

interface NavLink {
    to: string;
    label: string;
}

interface HeaderProps {
    links?: NavLink[];
}

const Header: React.FC<HeaderProps> = ({links}) => {
    const location = useLocation();
    const {isLoggedIn} = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 如果沒有提供鏈接，使用默認鏈接
    const navLinks = links || [
        {to: '/', label: '首頁'},
        {to: '/dashboard', label: '儀表板'},
        {to: '/advanced-dashboard', label: '進階分析'},
        {to: '/prediction', label: '單筆預測'},
        {to: '/batch', label: '批量預測'},
        {to: '/history', label: '預測歷史'},
        {to: '/about', label: '關於'}
    ];

    // 根據登錄狀態過濾鏈接
    const filteredLinks = isLoggedIn
        ? navLinks
        : navLinks.filter(link => link.to === '/' || link.to === '/about');

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center">
                    {/* 網站Logo */}
                    <Link to="/" className="flex items-center mr-6">
                        <span className="font-bold text-xl">保險交叉銷售預測</span>
                    </Link>

                    {/* 桌面版導航菜單 */}
                    <nav className="hidden md:flex space-x-6">
                        {filteredLinks.map((link) => {
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        isActive
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* 右側用戶菜單和移動端菜單按鈕 */}
                <div className="flex items-center space-x-4">
                    {/* 主題切換按鈕 */}
                    <ModeToggle/>

                    {/* 用戶菜單 */}
                    <UserMenu/>

                    {/* 移動端菜單按鈕 */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            aria-expanded={mobileMenuOpen}
                            onClick={toggleMobileMenu}
                        >
                            <span className="sr-only">開啟菜單</span>
                            <svg
                                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                            <svg
                                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 移動端菜單 */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    {filteredLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                                    isActive
                                        ? 'border-primary bg-accent text-foreground'
                                        : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:border-border hover:text-foreground'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};

export default Header; 