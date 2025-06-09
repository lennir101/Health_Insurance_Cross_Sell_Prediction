import React, {useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {login, error, clearError, isLoggedIn} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 處理來自其他頁面的重定向
    const from = location.state?.from?.pathname || '/';

    // 如果已登錄，重定向到首頁或來源頁面
    useEffect(() => {
        if (isLoggedIn) {
            navigate(from, {replace: true});
        }
    }, [isLoggedIn, navigate, from]);

    // 處理來自AuthContext的錯誤
    useEffect(() => {
        if (error) {
            setErrorMessage(error);
        }
    }, [error]);

    // 處理登錄提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        clearError();

        // 表單驗證
        if (!username || !password) {
            setErrorMessage('請輸入用戶名和密碼');
            setLoading(false);
            return;
        }

        try {
            const success = await login({username, password});
            if (success) {
                navigate(from, {replace: true});
            }
        } catch (err) {
            setErrorMessage('登錄過程中發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center py-12">
            <div className="mx-auto grid w-full max-w-md gap-6 px-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-3xl font-bold">登錄</h1>
                    <p className="text-muted-foreground">
                        輸入您的用戶名和密碼以登錄您的帳戶
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMessage && (
                        <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    {/* 用戶名輸入 */}
                    <div className="space-y-2">
                        <label htmlFor="username"
                               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            用戶名
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* 密碼輸入 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password"
                                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                密碼
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                忘記密碼?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* 登錄按鈕 */}
                    <button
                        type="submit"
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? '登錄中...' : '登錄'}
                    </button>

                    {/* 註冊提示 */}
                    <div className="mt-4 text-center text-sm">
                        沒有帳戶?{' '}
                        <Link to="/register" className="text-primary hover:underline">
                            建立帳戶
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; 