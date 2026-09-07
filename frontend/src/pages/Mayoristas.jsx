import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Mayoristas() {
  const [mayoristas, setMayoristas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ numeroCliente: '', nombreCompleto: '', telefono: '', tipoBeneficio: 'NORMAL' });

  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombreCompleto: '', telefono: '' });

  function cargarDatos() {
    setCargando(true);
    api.get('/mayoristas').then((res) => setMayoristas(res.data)).finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearMayorista(e) {
    e.preventDefault();
    try {
      await api.post('/mayoristas', form);
      setForm({ numeroCliente: '', nombreCompleto: '', telefono: '', tipoBeneficio: 'NORMAL' });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear el mayorista');
    }
  }

  async function revisarInactivos() {
    if (!confirm('¿Revisar y suspender mayoristas con más de 30 días sin comprar?')) return;
    try {
      const res = await api.post('/mayoristas/revisar-inactivos');
      alert(res.data.mensaje);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al revisar mayoristas');
    }
  }

  function iniciarEdicion(m) {
    setEditando(m.id);
    setFormEdicion({ nombreCompleto: m.nombreCompleto, telefono: m.telefono });
  }

  async function guardarEdicion(id) {
    try {
      await api.put(`/mayoristas/${id}`, formEdicion);
      setEditando(null);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al editar el mayorista');
    }
  }

  async function reactivarManual(id, nombre) {
    if (!confirm(`¿Reactivar manualmente a "${nombre}"? Confirma que cumple el minimo de $1,500 en compra.`)) return;
    try {
      await api.put(`/mayoristas/${id}/reactivar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al reactivar el mayorista');
    }
  }

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Mayoristas
          </h2>
          <div className="flex gap-3">
            <button
              onClick={revisarInactivos}
              className="border border-[#c9a227] text-[#c9a227] px-4 py-2 text-sm hover:bg-[#c9a227]/10 transition-colors"
            >
              Revisar inactivos
            </button>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
            >
              {mostrarForm ? 'Cancelar' : '+ Nuevo mayorista'}
            </button>
          </div>
        </div>

        {mostrarForm && (
          <form onSubmit={crearMayorista} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-3 gap-4">
            <input placeholder="Número de cliente" value={form.numeroCliente} onChange={(e) => setForm({ ...form, numeroCliente: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input placeholder="Nombre completo" value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <select value={form.tipoBeneficio} onChange={(e) => setForm({ ...form, tipoBeneficio: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-3">
              <option value="NORMAL">Normal (activa con $4,000, obtiene carpeta con $5,000)</option>
              <option value="SIN_CARPETA">Sin carpeta (activa con $4,000, sin regalo)</option>
              <option value="ESPECIAL">Especial / caso aislado (activa con $1,500, sin regalo)</option>
            </select>
            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-3">
              Guardar mayorista
            </button>
          </form>
        )}

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
                <th className="pb-3">No. Cliente</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Teléfono</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Acumulado</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {mayoristas.map((m) => (
                <tr key={m.id} className="border-b border-[#2a251c]/50">
                  <td className="py-3 text-[#f5f1e8]">{m.numeroCliente}</td>
                  {editando === m.id ? (
                    <>
                      <td className="py-2">
                        <input
                          value={formEdicion.nombreCompleto}
                          onChange={(e) => setFormEdicion({ ...formEdicion, nombreCompleto: e.target.value })}
                          className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          value={formEdicion.telefono}
                          onChange={(e) => setFormEdicion({ ...formEdicion, telefono: e.target.value })}
                          className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-full"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 text-[#f5f1e8]">{m.nombreCompleto}</td>
                      <td className="py-3 text-[#8a8478]">{m.telefono}</td>
                    </>
                  )}
                  <td className="py-3 text-[#8a8478] text-xs">{m.tipoBeneficio}</td>
                  <td className="py-3 text-[#c9a227]">${Number(m.totalAcumuladoPeriodo).toFixed(2)}</td>
                  <td className={`py-3 ${m.estado === 'ACTIVO' ? 'text-green-400' : 'text-amber-400'}`}>{m.estado}</td>
                  <td className="py-3">
                    {editando === m.id ? (
                      <div className="flex gap-3">
                        <button onClick={() => guardarEdicion(m.id)} className="text-xs text-[#c9a227]">Guardar</button>
                        <button onClick={() => setEditando(null)} className="text-xs text-red-400">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => iniciarEdicion(m)} className="text-xs text-[#8a8478] hover:text-[#c9a227] hover:underline">
                          Editar
                        </button>
                        {m.estado === 'SUSPENDIDO' && (
                          <button onClick={() => reactivarManual(m.id, m.nombreCompleto)} className="text-xs text-green-400 hover:underline">
                            Reactivar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}