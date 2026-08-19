import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(usuario, contrasena);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1815] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto mb-4 border border-[#c9a227] rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#c9a227] rotate-45"></div>
          </div>
          <h1 className="text-3xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Sistema Joyería
          </h1>
          <p className="text-[#8a8478] text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Panel administrativo
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div>
            <label className="block text-xs text-[#8a8478] mb-1.5 tracking-wide uppercase">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 rounded-none outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[#8a8478] mb-1.5 tracking-wide uppercase">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 rounded-none outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm border-l-2 border-red-400 pl-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 mt-2 transition-colors disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}