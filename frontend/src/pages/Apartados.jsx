import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Apartados() {
  const [apartados, setApartados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [montosAbono, setMontosAbono] = useState({});

  const [form, setForm] = useState({ productoId: '', clienteNombre: '', clienteTelefono: '', anticipo: '' });

  function cargarDatos() {
    setCargando(true);
    Promise.all([api.get('/apartados'), api.get('/productos?estado=DISPONIBLE')])
      .then(([resApartados, resProductos]) => {
        setApartados(resApartados.data);
        setProductos(resProductos.data);
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearApartado(e) {
    e.preventDefault();
    setMensaje('');
    try {
      await api.post('/apartados', form);
      setForm({ productoId: '', clienteNombre: '', clienteTelefono: '', anticipo: '' });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al crear el apartado');
    }
  }

  async function registrarAbono(id) {
    const monto = montosAbono[id];
    if (!monto) return;
    try {
      await api.post(`/apartados/${id}/abono`, { monto: Number(monto), metodoPago: 'EFECTIVO' });
      setMontosAbono({ ...montosAbono, [id]: '' });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar el abono');
    }
  }

  async function entregar(id) {
    try {
      await api.put(`/apartados/${id}/entregar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al entregar');
    }
  }

  async function cancelar(id) {
    if (!confirm('¿Cancelar este apartado? El producto volverá a estar disponible.')) return;
    try {
      await api.put(`/apartados/${id}/cancelar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  }

  const estadoColor = {
    ACTIVO: 'text-amber-400',
    LIQUIDADO: 'text-blue-400',
    ENTREGADO: 'text-green-400',
    CANCELADO: 'text-red-400',
  };

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Apartados
          </h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo apartado'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={crearApartado} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
            <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" required>
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.codigoPrecio.precio).toFixed(2)}</option>
              ))}
            </select>

            <input placeholder="Nombre del cliente" value={form.clienteNombre} onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />

            <input placeholder="Teléfono" value={form.clienteTelefono} onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />

            <input type="number" placeholder="Anticipo (mínimo 20%)" value={form.anticipo} onChange={(e) => setForm({ ...form, anticipo: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" required />

            {mensaje && <p className="text-red-400 text-xs col-span-2">{mensaje}</p>}

            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2">
              Crear apartado
            </button>
          </form>
        )}

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <div className="space-y-3">
            {apartados.map((a) => (
              <div key={a.id} className="border border-[#2a251c] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[#f5f1e8] text-sm">{a.producto.nombre} — {a.clienteNombre}</p>
                  <p className="text-[#8a8478] text-xs">
                    Tel: {a.clienteTelefono} • Saldo: ${Number(a.saldoPendiente).toFixed(2)} de ${Number(a.precioTotal).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs ${estadoColor[a.estado]}`}>{a.estado}</span>

                  {a.estado === 'ACTIVO' && (
                    <>
                      <input
                        type="number"
                        placeholder="Monto"
                        value={montosAbono[a.id] || ''}
                        onChange={(e) => setMontosAbono({ ...montosAbono, [a.id]: e.target.value })}
                        className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-20"
                      />
                      <button onClick={() => registrarAbono(a.id)} className="text-xs text-[#c9a227] hover:underline">
                        Abonar
                      </button>
                      <button onClick={() => cancelar(a.id)} className="text-xs text-red-400 hover:underline">
                        Cancelar
                      </button>
                    </>
                  )}

                  {a.estado === 'LIQUIDADO' && (
                    <button onClick={() => entregar(a.id)} className="text-xs text-green-400 hover:underline">
                      Marcar como entregado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}