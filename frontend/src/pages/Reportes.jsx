import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Ticket from '../components/Ticket';
import { useAuth } from '../context/AuthContext';

function TablaDevoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/devoluciones')
      .then((res) => setDevoluciones(res.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="text-[#8a8478] text-sm">Cargando...</p>;
  if (devoluciones.length === 0) return <p className="text-[#8a8478] text-sm">Sin devoluciones registradas.</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
          <th className="pb-3">Folio</th>
          <th className="pb-3">Fecha</th>
          <th className="pb-3">Devuelto</th>
          <th className="pb-3">Nuevo</th>
          <th className="pb-3">Diferencia</th>
        </tr>
      </thead>
      <tbody>
        {devoluciones.map((d) => (
          <tr key={d.id} className="border-b border-[#2a251c]/50">
            <td className="py-3 text-[#f5f1e8]">{d.folio}</td>
            <td className="py-3 text-[#8a8478]">{new Date(d.fecha).toLocaleDateString('es-MX')}</td>
            <td className="py-3 text-[#8a8478]">{d.productoDevuelto?.sku}</td>
            <td className="py-3 text-[#8a8478]">{d.productoNuevo?.sku}</td>
            <td className="py-3 text-[#c9a227]">${Number(d.diferenciaPagada).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mensual');
  const [vista, setVista] = useState('VENTAS');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ticketData, setTicketData] = useState(null);
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

  async function verTicket(ventaId) {
    try {
      const resVenta = await api.get(`/ventas/${ventaId}`);
      const resTickets = await api.get(`/tickets/venta/${ventaId}`);

      let versiculo = '';
      if (resTickets.data.length > 0) {
        versiculo = '';
      }

      let ticketExistente = resTickets.data[0];
      let datosTicket;

      if (ticketExistente) {
        datosTicket = { venta: resVenta.data, versiculo: '' };
      } else {
        const resNuevo = await api.post('/tickets', { ventaId, tipo: 'DIGITAL' });
        datosTicket = { venta: resVenta.data, versiculo: resNuevo.data.versiculo };
      }

      setTicketData(datosTicket);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al obtener el ticket');
    }
  }

  function imprimirTicket() {
    window.print();
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
                <div className="flex gap-2 mb-4">
          <button
            onClick={() => setVista('VENTAS')}
            className={`px-4 py-2 text-sm border ${vista === 'VENTAS' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'}`}
          >
            Ventas
          </button>
          <button
            onClick={() => setVista('DEVOLUCIONES')}
            className={`px-4 py-2 text-sm border ${vista === 'DEVOLUCIONES' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'}`}
          >
            Devoluciones
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

        {vista === 'DEVOLUCIONES' ? (
          <TablaDevoluciones />
        ) : cargando ? (
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
                  <th className="pb-3">Acción</th>
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
                    <td className="py-3 flex gap-3">
                      <button onClick={() => verTicket(v.id)} className="text-xs text-[#c9a227] hover:underline">
                        Ver ticket
                      </button>
                      {usuario?.rol === 'ADMINISTRADOR' && (
                        <button onClick={() => eliminarVenta(v.id)} className="text-xs text-red-400 hover:underline">
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {ticketData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={imprimirTicket} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setTicketData(null)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
            <Ticket venta={ticketData.venta} versiculo={ticketData.versiculo} />
          </div>
        </div>
      )}
    </Layout>
  );
}