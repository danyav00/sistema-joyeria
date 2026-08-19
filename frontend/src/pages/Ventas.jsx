import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Ventas() {
  const [turno, setTurno] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pagos, setPagos] = useState([{ metodoPago: 'EFECTIVO', monto: '' }]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    Promise.all([api.get('/turnos/activo'), api.get('/productos?estado=DISPONIBLE')])
      .then(([resTurno, resProductos]) => {
        setTurno(resTurno.data);
        setProductos(resProductos.data);
      })
      .finally(() => setCargando(false));
  }, []);

  async function abrirTurno(tipo) {
    try {
      const res = await api.post('/turnos/abrir', { tipo });
      setTurno(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al abrir turno');
    }
  }

  function agregarAlCarrito(producto) {
    const yaExiste = carrito.find((item) => item.productoId === producto.id);
    if (yaExiste) {
      setCarrito(carrito.map((item) =>
        item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.codigoPrecio.precio),
        cantidad: 1,
      }]);
    }
  }

  function quitarDelCarrito(productoId) {
    setCarrito(carrito.filter((item) => item.productoId !== productoId));
  }

  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const totalPagos = pagos.reduce((suma, p) => suma + (Number(p.monto) || 0), 0);

  function actualizarPago(index, campo, valor) {
    const nuevosPagos = [...pagos];
    nuevosPagos[index][campo] = valor;
    setPagos(nuevosPagos);
  }

  function agregarPago() {
    setPagos([...pagos, { metodoPago: 'EFECTIVO', monto: '' }]);
  }

  async function confirmarVenta() {
    setMensaje('');
    try {
      await api.post('/ventas', {
        turnoId: turno.id,
        tipoVenta: 'MENUDEO',
        productos: carrito.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
        pagos: pagos.map((p) => ({ metodoPago: p.metodoPago, monto: Number(p.monto) })),
        descuento: 0,
      });
      setMensaje('Venta registrada con exito');
      setCarrito([]);
      setPagos([{ metodoPago: 'EFECTIVO', monto: '' }]);
      const res = await api.get('/productos?estado=DISPONIBLE');
      setProductos(res.data);
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar la venta');
    }
  }

  if (cargando) {
    return <Layout><div className="p-8 text-[#8a8478]">Cargando...</div></Layout>;
  }

  if (!turno) {
    return (
      <Layout>
        <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Punto de Venta
          </h2>
          <p className="text-[#8a8478] mb-4">No tienes un turno abierto. Abre uno para comenzar a vender.</p>
          <div className="flex gap-3">
            <button onClick={() => abrirTurno('MATUTINO')} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
              Abrir turno matutino
            </button>
            <button onClick={() => abrirTurno('VESPERTINO')} className="border border-[#c9a227] text-[#c9a227] px-4 py-2 text-sm font-medium">
              Abrir turno vespertino
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 grid grid-cols-3 gap-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="col-span-2">
          <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Punto de Venta
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {productos.map((p) => (
              <button
                key={p.id}
                onClick={() => agregarAlCarrito(p)}
                className="border border-[#2a251c] hover:border-[#c9a227] p-4 text-left transition-colors"
              >
                <p className="text-[#f5f1e8] text-sm">{p.nombre}</p>
                <p className="text-[#8a8478] text-xs">{p.sku} • {p.material}</p>
                <p className="text-[#c9a227] mt-1">${Number(p.codigoPrecio.precio).toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[#2a251c] p-5 h-fit">
          <h3 className="text-sm text-[#f5f1e8] uppercase tracking-wide mb-4">Carrito</h3>

          {carrito.length === 0 ? (
            <p className="text-[#8a8478] text-sm">Sin productos</p>
          ) : (
            <div className="space-y-2 mb-4">
              {carrito.map((item) => (
                <div key={item.productoId} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-[#f5f1e8]">{item.nombre}</p>
                    <p className="text-[#8a8478] text-xs">x{item.cantidad} — ${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                  <button onClick={() => quitarDelCarrito(item.productoId)} className="text-red-400 text-xs">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#2a251c] pt-3 mb-4">
            <p className="text-[#f5f1e8] flex justify-between">
              <span>Total</span>
              <span className="text-[#c9a227]">${total.toFixed(2)}</span>
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-xs text-[#8a8478] uppercase">Pagos</p>
            {pagos.map((pago, index) => (
              <div key={index} className="flex gap-2">
                <select
                  value={pago.metodoPago}
                  onChange={(e) => actualizarPago(index, 'metodoPago', e.target.value)}
                  className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1.5 flex-1"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="DEPOSITO">Depósito</option>
                </select>
                <input
                  type="number"
                  placeholder="Monto"
                  value={pago.monto}
                  onChange={(e) => actualizarPago(index, 'monto', e.target.value)}
                  className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1.5 w-20"
                />
              </div>
            ))}
            <button onClick={agregarPago} className="text-[#8a8478] text-xs hover:text-[#c9a227]">
              + Agregar otro método
            </button>
          </div>

          <p className="text-xs text-[#8a8478] mb-3">
            Pagado: ${totalPagos.toFixed(2)} {totalPagos !== total && `(faltan $${(total - totalPagos).toFixed(2)})`}
          </p>

          {mensaje && <p className="text-xs text-amber-400 mb-3">{mensaje}</p>}

          <button
            onClick={confirmarVenta}
            disabled={carrito.length === 0 || totalPagos !== total}
            className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 text-sm disabled:opacity-40"
          >
            Confirmar venta
          </button>
        </div>
      </div>
    </Layout>
  );
}