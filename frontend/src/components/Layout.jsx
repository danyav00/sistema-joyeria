import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { aplicarColorPestana } from '../utils/colorPestana';
import logo from '../assets/logo.png';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', roles: ['ADMINISTRADOR', 'EMPLEADO', 'SOCIO'] },
  { path: '/ventas', label: 'Punto de Venta', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/devoluciones', label: 'Devoluciones', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/inventario', label: 'Inventario', roles: ['ADMINISTRADOR', 'EMPLEADO', 'SOCIO'] },
  { path: '/apartados', label: 'Apartados', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/mayoristas', label: 'Mayoristas', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/creditos-mayorista', label: 'Créditos Mayorista', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/gastos', label: 'Gastos', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/cortes', label: 'Cortes', roles: ['ADMINISTRADOR', 'EMPLEADO'] },
  { path: '/reportes', label: 'Reportes', roles: ['ADMINISTRADOR', 'SOCIO'] },
  { path: '/usuarios', label: 'Usuarios', roles: ['ADMINISTRADOR'] },
  { path: '/auditoria', label: 'Auditoría', roles: ['ADMINISTRADOR'] },
];

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const { modoOscuro, toggleTema } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [modoOscuro]);

  useEffect(() => {
    aplicarColorPestana(usuario);
  }, [usuario]);

  const itemsVisibles = menuItems.filter((item) => item.roles.includes(usuario?.rol));

  return (
    <div className={`min-h-screen bg-[#1a1815] flex ${!modoOscuro ? 'light-mode' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="w-56 border-r border-[#2a251c] flex flex-col">
        <div className="p-5 border-b border-[#2a251c] flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
            <img src={logo} alt="Nixca Joyería" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Nixca Joyería
          </h1>
        </div>

        <nav className="flex-1 py-4 overflow-auto">
          {itemsVisibles.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-5 py-2.5 text-sm border-l-2 transition-colors ${
                  activo
                    ? 'border-[#c9a227] text-[#c9a227] bg-[#c9a227]/5'
                    : 'border-transparent text-[#8a8478] hover:text-[#f5f1e8]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-[#2a251c]">
          <p className="text-sm text-[#f5f1e8]">{usuario?.nombre}</p>
          <p className="text-xs text-[#8a8478] mb-3">{usuario?.rol}</p>
          <button
            onClick={toggleTema}
            className="text-xs text-[#8a8478] hover:text-[#c9a227] transition-colors block mb-2"
          >
            {modoOscuro ? '☀ Modo claro' : '🌙 Modo oscuro'}
          </button>
          <button
            onClick={logout}
            className="text-xs text-[#8a8478] hover:text-[#c9a227] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}