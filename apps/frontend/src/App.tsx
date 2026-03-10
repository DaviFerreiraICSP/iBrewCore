import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Setup from './pages/Setup'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import POS from './pages/POS'
import ForgotPassword from './pages/ForgotPassword'
import Vendas from './pages/Vendas'
import Layout from './components/Layout'
import api from './services/api'
import { useAuthStore } from './store/authStore'

function App() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/user/setup-status');
        setIsInitialized(response.data.isInitialized);
      } catch (error) {
        console.error('Failed to check setup status', error);
        setIsInitialized(true); 
      }
    };
    checkStatus();
  }, []);

  if (isInitialized === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F2EDE4' }}>
        <p style={{ fontStyle: 'italic', color: '#666' }}>Iniciando iBranch...</p>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!token) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Routes>
        {/* Public Routes */}
        <Route path="/setup" element={!isInitialized ? <Setup /> : <Navigate to="/login" />} />
        <Route path="/login" element={isInitialized ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected App Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="produtos" element={<Products />} />
          <Route path="categorias" element={<Categories />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
        
        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={isInitialized ? (token ? "/dashboard" : "/login") : "/setup"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
