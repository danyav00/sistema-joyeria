import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mensual');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    setCargando(true);
    api.get(`/reportes/ventas?periodo=${periodo}`)
      .then((res) => setReporte(res.data))
      .finally(() => setCargando(false));
  }, [periodo]);

  function recargar() {
    setCargando(true);
    api.get(`/reportes/ventas?periodo=${periodo}`)
      .then((res) => setReporte(res.data))
      .finally(() => setCargando(false));
  }

  async function descargarExcel() {
    const respuesta = await api.get(`/reportes/ventas/excel?periodo=${periodo}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([respuesta.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${periodo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function eliminarVenta(id) {
    if (!confirm('¿Eliminar esta venta? Esta accion no se puede deshacer y no regresa el inventario automaticamente.')) return;
    try {
      await api.delete(`/ventas/${id}`);
      recargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar la venta');
    }
  }

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Reportes de ventas
          </h2>
          <button onClick={descargarExcel} className="border border-[#c9a227] text-[#c9a227] px-4 py-2 text-sm hover:bg-[#c9a227]/10 transition-colors">
            Descargar Excel
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['diario', 'semanal', 'mensual', 'bimestral'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 text-sm capitalize border ${
                periodo === p ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <>
            <div className="border border-[#2a251c] p-5 mb-6 flex gap-10">
              <div>
                <p className="text-xs text-[#8a8478] uppercase mb-1">Total en ventas</p>
                <p className="text-2xl text-[#c9a227]">${reporte.totalVentas.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-[#8a8478] uppercase mb-1">Cantidad de ventas</p>
                <p className="text-2xl text-[#f5f1e8]">{reporte.cantidadVentas}</p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
                  <th className="pb-3">Folio</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Usuario</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Total</th>
                  {usuario?.rol === 'ADMINISTRADOR' && <th className="pb-3">Acción</th>}
                </tr>
              </thead>
              <tbody>
                {reporte.ventas.map((v) => (
                  <tr key={v.id} className="border-b border-[#2a251c]/50">
                    <td className="py-3 text-[#f5f1e8]">{v.folio}</td>
                    <td className="py-3 text-[#8a8478]">{new Date(v.fecha).toLocaleString('es-MX')}</td>
                    <td className="py-3 text-[#8a8478]">{v.usuario.nombre}</td>
                    <td className="py-3 text-[#8a8478]">{v.tipoVenta}</td>
                    <td className="py-3 text-[#c9a227]">${Number(v.total).toFixed(2)}</td>
                    {usuario?.rol === 'ADMINISTRADOR' && (
                      <td className="py-3">
                        <button onClick={() => eliminarVenta(v.id)} className="text-xs text-red-400 hover:underline">
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Layout>
  );
}