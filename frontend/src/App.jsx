import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Apartados from './pages/Apartados';
import Mayoristas from './pages/Mayoristas';
import Gastos from './pages/Gastos';
import Cortes from './pages/Cortes';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Auditoria from './pages/Auditoria';
import CreditosMayorista from './pages/CreditosMayorista';
import Devoluciones from './pages/Devoluciones';

function RutaProtegida({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/inventario"
        element={
          <RutaProtegida>
            <Inventario />
          </RutaProtegida>
        }
      />
      <Route
        path="/ventas"
        element={
          <RutaProtegida>
            <Ventas />
          </RutaProtegida>
        }
      />
      <Route
        path="/apartados"
        element={
          <RutaProtegida>
            <Apartados />
          </RutaProtegida>
        }
      />
      <Route
        path="/mayoristas"
        element={
          <RutaProtegida>
            <Mayoristas />
          </RutaProtegida>
        }
      />
      <Route
        path="/gastos"
        element={
          <RutaProtegida>
            <Gastos />
          </RutaProtegida>
        }
      />
      <Route
        path="/cortes"
        element={
          <RutaProtegida>
            <Cortes />
          </RutaProtegida>
        }
      />
      <Route
        path="/reportes"
        element={
          <RutaProtegida>
            <Reportes />
          </RutaProtegida>
        }
      />
      <Route
        path="/usuarios"
        element={
          <RutaProtegida>
            <Usuarios />
          </RutaProtegida>
        }
      />
      <Route
        path="/auditoria"
        element={
          <RutaProtegida>
            <Auditoria />
          </RutaProtegida>
        }
      />
            <Route
        path="/creditos-mayorista"
        element={
          <RutaProtegida>
            <CreditosMayorista />
          </RutaProtegida>
        }
      />
            <Route
        path="/devoluciones"
        element={
          <RutaProtegida>
            <Devoluciones />
          </RutaProtegida>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;