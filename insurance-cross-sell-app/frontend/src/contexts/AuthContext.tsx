import React, {createContext, useContext, useState, useEffect} from 'react';
import authService, {User, LoginRequest, RegisterRequest} from '@/services/authService';

// 定義上下文類型
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (credentials: LoginRequest) => Promise<boolean>;
    register: (userData: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

// 創建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 上下文提供者組件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // 為了開發方便，預設為已登入狀態
    const [user, setUser] = useState<User | null>({
        id: 1,
        username: "admin",
        email: "admin@example.com",
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 初始化時檢查是否已登錄
    useEffect(() => {
        // 開發階段跳過登入檢查
        setLoading(false);
    }, []);

    // 登錄方法
    const login = async (credentials: LoginRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const loggedInUser = await authService.login(credentials);
            if (loggedInUser) {
                setUser(loggedInUser);
                return true;
            } else {
                setError('登錄失敗: 用戶名或密碼錯誤');
                return false;
            }
        } catch (err) {
            setError('登錄過程中發生錯誤');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 註冊方法
    const register = async (userData: RegisterRequest): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const registeredUser = await authService.register(userData);
            if (registeredUser) {
                return true;
            } else {
                setError('註冊失敗: 可能用戶名或電子郵件已存在');
                return false;
            }
        } catch (err) {
            setError('註冊過程中發生錯誤');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 登出方法
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // 清除錯誤
    const clearError = () => {
        setError(null);
    };

    // 計算登錄狀態
    const isLoggedIn = !!user;
    // 計算管理員狀態
    const isAdmin = !!user && user.is_admin;

    // 提供上下文值
    const contextValue: AuthContextType = {
        user,
        loading,
        error,
        isLoggedIn,
        isAdmin,
        login,
        register,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 自定義Hook，用於在組件中訪問認證上下文
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth必須在AuthProvider內部使用');
    }
    return context;
}; 