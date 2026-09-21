import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import TicketApartado from '../components/TicketApartado';
import Ticket from '../components/Ticket';
import { imprimirEnVentanaNueva } from '../utils/imprimirTicket';
import { useAuth } from '../context/AuthContext';

export default function Apartados() {
  const { usuario } = useAuth();
  const [apartados, setApartados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [montosAbono, setMontosAbono] = useState({});
  const [ticketApartado, setTicketApartado] = useState(null);
  const [ticketVentaLiquidacion, setTicketVentaLiquidacion] = useState(null);
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

  async function descargarExcel() {
    const respuesta = await api.get('/apartados/excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([respuesta.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'apartados_por_cliente.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function crearApartado(e) {
    e.preventDefault();
    setMensaje('');
    const producto = productos.find((p) => p.id === Number(form.productoId));
if (!producto || producto.existencia <= 0) {
  setMensaje('Producto agotado o no disponible');
  return;
}
if (Number(form.cantidad) > producto.existencia) {
  setMensaje(`Solo hay ${producto.existencia} disponibles`);
  return;
}
    try {
      const res = await api.post('/apartados', form);
      setForm({ productoId: '', clienteNombre: '', clienteTelefono: '', anticipo: '', cantidad: 1 });
      setMostrarForm(false);
      const producto = productos.find((p) => p.id === Number(form.productoId));
      setTicketApartado({ apartado: { ...res.data, producto }, tipo: 'CREADO', versiculo: res.data.versiculo, atendio: usuario?.nombre });
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al crear el apartado');
    }
  }

  function generarTicketVenta(apartado) {
    const ventaSimulada = {
      folio: apartado.folio,
      fecha: apartado.fechaApartado || new Date(),
      usuario: { nombre: usuario?.nombre || '—' },
      detalles: [{
        id: apartado.id,
        producto: apartado.producto,
        cantidad: apartado.cantidad,
        precioUnitario: Number(apartado.precioTotal) / apartado.cantidad,
        subtotal: Number(apartado.precioTotal),
      }],
      subtotal: Number(apartado.precioTotal),
      descuento: 0,
      total: Number(apartado.precioTotal),
      pagos: [{ id: 1, metodoPago: 'VARIOS (anticipo + abonos)', monto: Number(apartado.precioTotal) }],
    };
    setTicketVentaLiquidacion({ venta: ventaSimulada, versiculo: apartado.versiculo });
  }

  async function registrarAbono(id) {
    const monto = montosAbono[id];
    if (!monto) return;
    try {
      const res = await api.post(`/apartados/${id}/abono`, { monto: Number(monto), metodoPago: 'EFECTIVO' });
      setMontosAbono({ ...montosAbono, [id]: '' });
      const apartadoOriginal = apartados.find((a) => a.id === id);

      if (res.data.estado === 'LIQUIDADO') {
        generarTicketVenta({ ...res.data, producto: apartadoOriginal?.producto });
      } else {
        setTicketApartado({
          apartado: { ...res.data, producto: apartadoOriginal?.producto },
          tipo: 'ABONO',
          montoAbono: Number(monto),
          versiculo: res.data.versiculo,
          atendio: usuario?.nombre,
        });
      }
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
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
            >
              {mostrarForm ? 'Cancelar' : '+ Nuevo apartado'}
            </button>
            <button
              onClick={descargarExcel}
              className="border border-[#c9a227] text-[#c9a227] px-4 py-2 text-sm hover:bg-[#c9a227]/10 transition-colors"
            >
              Descargar Excel
            </button>
          </div>
        </div>

        {mostrarForm && (
  <form onSubmit={crearApartado} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
    {/* Input de búsqueda con selección automática */}
    <input
      type="text"
      placeholder="Teclea código o SKU del producto..."
      value={busquedaProducto}
      onChange={(e) => setBusquedaProducto(e.target.value)}
     onKeyPress={(e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const encontrado = productos.find(
      (p) =>
        p.sku.toLowerCase() === busquedaProducto.toLowerCase() ||
        p.nombre.toLowerCase() === busquedaProducto.toLowerCase()
    );

    if (!encontrado) {
      setMensaje('Producto no encontrado');
      return;
    }

    if (encontrado.existencia <= 0) {
      setMensaje('Producto agotado');
      return;
    }

    setForm({ ...form, productoId: encontrado.id });
    setMensaje(`Producto seleccionado: ${encontrado.nombre}`);
  }
}}
      className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2"
    />

    {/* Select como respaldo */}
  <select
  value={form.productoId}
  onChange={(e) => setForm({ ...form, productoId: e.target.value })}
  className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2"
  required
>
  <option value="">Selecciona un producto</option>
  {productosFiltrados.map((p) => {
    const agotado = p.existencia <= 0;
    return (
      <option 
        key={p.id} 
        value={p.id}
        disabled={agotado}
      >
        {p.sku} — {p.nombre} — ${Number(p.codigoPrecio.precio).toFixed(2)} — {agotado ? 'Agotado' : `Existencia: ${p.existencia}`}
      </option>
    );
  })}
</select>

    {productoSeleccionado && (
      <div className="col-span-2">
        <label className="text-xs text-[#8a8478] uppercase">
          Cantidad (máximo {productoSeleccionado.existencia})
        </label>
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

    <input
      placeholder="Nombre del cliente"
      value={form.clienteNombre}
      onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })}
      className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]"
      required
    />

    <input
      placeholder="Teléfono"
      value={form.clienteTelefono}
      onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })}
      className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]"
      required
    />

    <input
      type="number"
      placeholder="Anticipo (mínimo 20%)"
      value={form.anticipo}
      onChange={(e) => setForm({ ...form, anticipo: e.target.value })}
      className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2"
      required
    />

    {mensaje && <p className="text-red-400 text-xs col-span-2">{mensaje}</p>}

    <button
      type="submit"
      className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2"
    >
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
                  <p className="text-[#f5f1e8] text-sm">{a.producto.sku} — {a.producto.nombre} x{a.cantidad} — {a.clienteNombre}</p>
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
              <button onClick={() => imprimirEnVentanaNueva('ticket-imprimir')} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
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
              versiculo={ticketApartado.versiculo}
              atendio={ticketApartado.atendio}
            />
          </div>
        </div>
      )}

      {ticketVentaLiquidacion && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={() => window.print()} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setTicketVentaLiquidacion(null)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
            <Ticket venta={ticketVentaLiquidacion.venta} versiculo={ticketVentaLiquidacion.versiculo} tipoTicket="VENTA" />
          </div>
        </div>
      )}
    </Layout>
  );
}