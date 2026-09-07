import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Cortes() {
  const [turno, setTurno] = useState(null);
  const [cortes, setCortes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const { usuario } = useAuth();

  function cargarDatos() {
    setCargando(true);
    Promise.all([api.get('/turnos/activo'), api.get('/cortes')])
      .then(([resTurno, resCortes]) => {
        setTurno(resTurno.data);
        setCortes(resCortes.data);
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function generarCorte() {
    if (!confirm('¿Generar el corte de este turno? El turno se cerrará y no se podrán agregar más ventas ni gastos.')) return;
    setMensaje('');
    try {
      await api.post(`/cortes/turno/${turno.id}`);
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al generar el corte');
    }
  }

  async function eliminarCorte(id) {
    if (!confirm('¿Eliminar este corte? El turno correspondiente se reabrira. Esta accion no se puede deshacer.')) return;
    try {
      await api.delete(`/cortes/${id}`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el corte');
    }
  }

  if (cargando) return <Layout><div className="p-8 text-[#8a8478]">Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cortes de turno</h2>

        {turno ? (
          <div className="border border-[#2a251c] p-5 mb-6">
            <p className="text-[#f5f1e8] mb-3">Turno activo: {turno.tipo} — abierto a las {turno.horaApertura}</p>
            {mensaje && <p className="text-red-400 text-xs mb-3">{mensaje}</p>}
            <button onClick={generarCorte} className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm">
              Generar corte y cerrar turno
            </button>
          </div>
        ) : (
          <p className="text-[#8a8478] mb-6">No tienes un turno abierto actualmente.</p>
        )}

        {usuario?.rol === 'ADMINISTRADOR' && (
          <>
            <h3 className="text-sm text-[#f5f1e8] uppercase tracking-wide mb-4">Historial de cortes</h3>
            <div className="space-y-3">
          {cortes.map((c) => (
            <div key={c.id} className="border border-[#2a251c] p-4">
              <div className="flex justify-between mb-2">
                <p className="text-[#f5f1e8] text-sm">{c.turno.tipo} — {new Date(c.fecha).toLocaleDateString('es-MX')}</p>
                <p className="text-[#c9a227]">${Number(c.totalFinal).toFixed(2)}</p>
              </div>
                           <div className="grid grid-cols-4 gap-3 text-xs text-[#8a8478] mb-2">
                <p>Ventas: ${Number(c.totalVentas).toFixed(2)}</p>
                <p>Gastos: ${Number(c.totalGastos).toFixed(2)}</p>
                <p>Efectivo: ${Number(c.totalEfectivo).toFixed(2)}</p>
                <p>Tarjeta: ${Number(c.totalTarjeta).toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-[#8a8478]">
                <p>Oro: ${Number(c.totalOro || 0).toFixed(2)}</p>
                <p>Plata: ${Number(c.totalPlata || 0).toFixed(2)}</p>
                <p>Oro Laminado: ${Number(c.totalOroLaminado || 0).toFixed(2)}</p>
              </div>
              {usuario?.rol === 'ADMINISTRADOR' && (
                <button onClick={() => eliminarCorte(c.id)} className="text-xs text-red-400 hover:underline">
                  Eliminar corte
                </button>
              )}
            </div>
          ))}
                   </div>
          </>
        )}
      </div>
    </Layout>
  );
}