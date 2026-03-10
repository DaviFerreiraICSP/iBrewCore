import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  LogOut, 
  Tags,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/IBrewWhite.png';

const Layout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'PDV' },
    { to: '/produtos', icon: <Package size={20} />, label: 'Produtos' },
    { to: '/categorias', icon: <Tags size={20} />, label: 'Categorias' },
    { to: '/vendas', icon: <History size={20} />, label: 'Vendas' },
    { to: '/configuracoes', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{ 
          width: '280px', 
          margin: '12px', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1.5rem',
          height: 'calc(100vh - 24px)',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '28px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255,255,255,0.7)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '0 8px' }}>
          <img 
            src={logo} 
            alt="iBranch" 
            style={{ width: '220px', height: 'auto' }} 
          />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '16px',
                textDecoration: 'none',
                color: isActive ? 'var(--blue)' : '#666',
                fontWeight: isActive ? '800' : '600',
                transition: 'color 0.3s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-lens"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(20px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        boxShadow: '0 12px 32px rgba(0, 63, 130, 0.15), inset 0 2px 4px rgba(255,255,255,0.9)',
                        zIndex: 0
                      }}
                    />
                  )}
                  <span style={{ 
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    background: isActive ? 'linear-gradient(135deg, var(--blue), var(--sub-yellow))' : 'transparent',
                    color: isActive ? 'white' : 'var(--blue)', 
                    borderRadius: '12px',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 63, 130, 0.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem', marginTop: 'auto' }}>
          <div 
            onClick={() => navigate('/perfil')}
            style={{ 
              marginBottom: '1.5rem', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer',
              borderRadius: '20px',
              transition: 'background 0.2s',
              background: 'rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')}
          >
            <div style={{ width: '44px', height: '44px', background: 'var(--blue)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold', overflow: 'hidden' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--black)' }}>{user?.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#888' }}>{user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              background: 'rgba(255, 59, 48, 0.05)', 
              color: '#FF3B30',
              padding: '12px',
              boxShadow: 'none',
              borderRadius: '16px'
            }}
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className="app-scroll"
        style={{ 
          flex: 1, 
          height: '100vh',
          padding: '2rem 3rem',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
