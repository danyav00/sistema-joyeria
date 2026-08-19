import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Mayoristas() {
  const [mayoristas, setMayoristas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ numeroCliente: '', nombreCompleto: '', telefono: '' });

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
      setForm({ numeroCliente: '', nombreCompleto: '', telefono: '' });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear el mayorista');
    }
  }

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Mayoristas
          </h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo mayorista'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={crearMayorista} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-3 gap-4">
            <input placeholder="Número de cliente" value={form.numeroCliente} onChange={(e) => setForm({ ...form, numeroCliente: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input placeholder="Nombre completo" value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
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
                <th className="pb-3">Acumulado</th>
                <th className="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mayoristas.map((m) => (
                <tr key={m.id} className="border-b border-[#2a251c]/50">
                  <td className="py-3 text-[#f5f1e8]">{m.numeroCliente}</td>
                  <td className="py-3 text-[#f5f1e8]">{m.nombreCompleto}</td>
                  <td className="py-3 text-[#8a8478]">{m.telefono}</td>
                  <td className="py-3 text-[#c9a227]">${Number(m.totalAcumuladoPeriodo).toFixed(2)}</td>
                  <td className={`py-3 ${m.estado === 'ACTIVO' ? 'text-green-400' : 'text-amber-400'}`}>{m.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}