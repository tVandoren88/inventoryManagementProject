// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeToggleProvider, useThemeToggle } from "./theme/ThemeContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Parts from "./pages/Parts";
import Layout from "./components/Layout";
import {ErrorBoundary} from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Customers from "./pages/Customers";
import Admin from "./pages/Admin";
import MyAccount from "./pages/MyAccount";
import Invoices from "./pages/Invoices";
import Vendors from "./pages/Vendors";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <p>Loading...</p>;
    return user ? children : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
    const { toggleTheme, isDarkMode } = useThemeToggle();

    return (
        <>
            {/* <AppBarWithUserMenu toggleTheme={toggleTheme} isDarkMode={isDarkMode} /> */}
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route element={<ErrorBoundary><Layout/></ErrorBoundary>}>
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/parts" element={<ProtectedRoute><Parts /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                        <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                        <Route path="/myaccount" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeToggleProvider>
                <AppContent />
            </ThemeToggleProvider>
        </AuthProvider>
    );
};

export default App;
