import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import TicketApartado from '../components/TicketApartado';

export default function Apartados() {
  const [apartados, setApartados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [montosAbono, setMontosAbono] = useState({});
  const [ticketApartado, setTicketApartado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');

  const [form, setForm] = useState({ productoId: '', clienteNombre: '', clienteTelefono: '', anticipo: '', cantidad: 1 });

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
      const res = await api.post('/apartados', form);
      setForm({ productoId: '', clienteNombre: '', clienteTelefono: '', anticipo: '', cantidad: 1 });
      setMostrarForm(false);
      const producto = productos.find((p) => p.id === Number(form.productoId));
      setTicketApartado({ apartado: { ...res.data, producto }, tipo: 'CREADO' });
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al crear el apartado');
    }
  }

  async function registrarAbono(id) {
    const monto = montosAbono[id];
    if (!monto) return;
    try {
      const res = await api.post(`/apartados/${id}/abono`, { monto: Number(monto), metodoPago: 'EFECTIVO' });
      setMontosAbono({ ...montosAbono, [id]: '' });
      const apartadoOriginal = apartados.find((a) => a.id === id);
      setTicketApartado({
        apartado: { ...res.data, producto: apartadoOriginal?.producto },
        tipo: 'ABONO',
        montoAbono: Number(monto),
      });
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

  const productoSeleccionado = productos.find((p) => p.id === Number(form.productoId));
  const productosFiltrados = productos.filter((p) => {
    const texto = busquedaProducto.toLowerCase();
    return p.sku.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto);
  });

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
            <input
              type="text"
              placeholder="Buscar producto por SKU o nombre..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2"
            />

            <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" required>
              <option value="">Selecciona un producto</option>
              {productosFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.nombre} — ${Number(p.codigoPrecio.precio).toFixed(2)} — Existencia: {p.existencia}
                </option>
              ))}
            </select>

            {productoSeleccionado && (
              <div className="col-span-2">
                <label className="text-xs text-[#8a8478] uppercase">Cantidad (máximo {productoSeleccionado.existencia})</label>
                <input
                  type="number"
                  min="1"
                  max={productoSeleccionado.existencia}
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  onBlur={(e) => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    if (val > productoSeleccionado.existencia) val = productoSeleccionado.existencia;
                    setForm((prev) => ({ ...prev, cantidad: val }));
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]"
                />
              </div>
            )}

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
                  <p className="text-[#f5f1e8] text-sm">{a.producto.nombre} x{a.cantidad} — {a.clienteNombre}</p>
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

      {ticketApartado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={() => window.print()} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setTicketApartado(null)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
            <TicketApartado
              apartado={ticketApartado.apartado}
              tipo={ticketApartado.tipo}
              montoAbono={ticketApartado.montoAbono}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}