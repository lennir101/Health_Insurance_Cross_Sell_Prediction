import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import {AuthProvider} from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import {MainLayout} from './components/layout'

// 頁面導入
import LoginPage from './pages/auth/LoginPage'
import HomePage from './pages/HomePage'
import PredictionPage from './pages/PredictionPage'
import BatchPredictionPage from './pages/BatchPredictionPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import AdvancedDashboard from './pages/AdvancedDashboard'
import PresentationPage from './pages/PresentationPage'

const App: React.FC = () => {
    // 定義導航鏈接
    const navLinks = [
        {to: '/', label: '首頁'},
        {to: '/dashboard', label: '儀表板'},
        {to: '/advanced-dashboard', label: '進階分析'},
        {to: '/prediction', label: '單筆預測'},
        {to: '/batch', label: '批量預測'},
        {to: '/history', label: '預測歷史'},
        {to: '/presentation', label: '項目演示'},
        {to: '/about', label: '關於'}
    ];

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* 認證路由 */}
                    <Route path="/login" element={<LoginPage/>}/>

                    {/* 保護路由 */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <HomePage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/prediction"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <PredictionPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/batch"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <BatchPredictionPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <DashboardPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <HistoryPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/about"
                        element={
                            <MainLayout links={navLinks}>
                                <AboutPage/>
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/advanced-dashboard"
                        element={
                            <ProtectedRoute>
                                <MainLayout links={navLinks}>
                                    <AdvancedDashboard/>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/presentation"
                        element={
                            <MainLayout links={navLinks}>
                                <PresentationPage/>
                            </MainLayout>
                        }
                    />

                    {/* 404頁面 - 重定向到首頁 */}
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App 