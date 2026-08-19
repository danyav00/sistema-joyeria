import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Gastos() {
  const [turno, setTurno] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ categoria: '', concepto: '', monto: '', metodoPago: 'EFECTIVO' });
  const [mensaje, setMensaje] = useState('');

  function cargarDatos() {
    setCargando(true);
    api.get('/turnos/activo').then((res) => {
      setTurno(res.data);
      if (res.data) {
        api.get(`/gastos?turnoId=${res.data.id}`).then((r) => setGastos(r.data)).finally(() => setCargando(false));
      } else {
        setCargando(false);
      }
    });
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function registrarGasto(e) {
    e.preventDefault();
    setMensaje('');
    try {
      await api.post('/gastos', { ...form, turnoId: turno.id });
      setForm({ categoria: '', concepto: '', monto: '', metodoPago: 'EFECTIVO' });
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar el gasto');
    }
  }

  if (cargando) return <Layout><div className="p-8 text-[#8a8478]">Cargando...</div></Layout>;

  if (!turno) {
    return (
      <Layout>
        <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          <h2 className="text-2xl text-[#f5f1e8] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gastos</h2>
          <p className="text-[#8a8478]">No tienes un turno abierto. Abre uno desde Punto de Venta para registrar gastos.</p>
        </div>
      </Layout>
    );
  }

  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Gastos</h2>

        <form onSubmit={registrarGasto} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
          <input placeholder="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
          <input placeholder="Concepto" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
          <input type="number" placeholder="Monto" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })}
            className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
          <select value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
            className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]">
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEPOSITO">Depósito</option>
          </select>
          {mensaje && <p className="text-red-400 text-xs col-span-2">{mensaje}</p>}
          <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2">
            Registrar gasto
          </button>
        </form>

        <p className="text-[#f5f1e8] mb-3">Total del turno: <span className="text-[#c9a227]">${totalGastos.toFixed(2)}</span></p>

        <div className="space-y-2">
          {gastos.map((g) => (
            <div key={g.id} className="border border-[#2a251c] p-3 flex justify-between text-sm">
              <div>
                <p className="text-[#f5f1e8]">{g.concepto}</p>
                <p className="text-[#8a8478] text-xs">{g.categoria} • {g.metodoPago}</p>
              </div>
              <p className="text-[#c9a227]">${Number(g.monto).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}