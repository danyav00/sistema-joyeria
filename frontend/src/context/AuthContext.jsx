import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  async function login(usuarioTexto, contrasena) {
    const respuesta = await api.post('/usuarios/login', {
      usuario: usuarioTexto,
      contrasena,
    });

    localStorage.setItem('token', respuesta.data.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
    setUsuario(respuesta.data.usuario);

    return respuesta.data.usuario;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}