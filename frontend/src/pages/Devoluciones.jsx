import { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import TicketDevolucion from '../components/TicketDevolucion';

export default function Devoluciones() {
  const [tipo, setTipo] = useState('CAMBIO');
  const [folioBusqueda, setFolioBusqueda] = useState('');
  const [ventaEncontrada, setVentaEncontrada] = useState(null);
  const [productoDevueltoId, setProductoDevueltoId] = useState('');
  const [danado, setDanado] = useState(false);
  const [skuNuevo, setSkuNuevo] = useState('');
  const [productoNuevo, setProductoNuevo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);

  async function buscarVenta(e) {
    e.preventDefault();
    setMensaje('');
    setVentaEncontrada(null);
    setResultado(null);
    try {
      const res = await api.get(`/devoluciones/venta/${folioBusqueda.trim()}`);
      setVentaEncontrada(res.data);
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Venta no encontrada');
    }
  }

  async function buscarProductoNuevo(e) {
    e.preventDefault();
    setMensaje('');
    try {
      const res = await api.get(`/productos?estado=DISPONIBLE`);
      const encontrado = res.data.find((p) => p.sku.toLowerCase() === skuNuevo.trim().toLowerCase());
      if (!encontrado) {
        setMensaje('Producto no encontrado o no disponible');
        setProductoNuevo(null);
        return;
      }
      setProductoNuevo(encontrado);
    } catch (err) {
      setMensaje('Error al buscar el producto');
    }
  }

  async function confirmarDevolucion() {
    setMensaje('');
    if (!productoDevueltoId) {
      setMensaje('Selecciona el producto que se devuelve');
      return;
    }
    if (tipo === 'CAMBIO' && !productoNuevo) {
      setMensaje('Busca el producto nuevo primero');
      return;
    }

    try {
      const res = await api.post('/devoluciones', {
        tipo,
        ventaOriginalId: ventaEncontrada.id,
        productoDevueltoId: Number(productoDevueltoId),
        danado: tipo === 'DEVOLUCION' ? danado : false,
        productoNuevoId: tipo === 'CAMBIO' ? productoNuevo.id : undefined,
        metodoPago: tipo === 'CAMBIO' ? metodoPago : undefined,
      });
      setResultado(res.data);
      setMostrarTicket(true);
      setVentaEncontrada(null);
      setFolioBusqueda('');
      setProductoDevueltoId('');
      setDanado(false);
      setSkuNuevo('');
      setProductoNuevo(null);
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar la devolucion');
    }
  }

  const productoSeleccionado = ventaEncontrada?.detalles.find((d) => d.productoId === Number(productoDevueltoId));
  const precioDevuelto = productoSeleccionado ? Number(productoSeleccionado.producto.codigoPrecio.precio) : 0;
  const precioNuevo = productoNuevo ? Number(productoNuevo.codigoPrecio.precio) : 0;
  const diferencia = Math.max(0, precioNuevo - precioDevuelto);

  return (
    <Layout>
      <div className="p-8 max-w-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Devoluciones y Cambios
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipo('CAMBIO')}
            className={`px-4 py-2 text-sm border ${tipo === 'CAMBIO' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'}`}
          >
            Cambio (modelo/talla)
          </button>
          <button
            onClick={() => setTipo('DEVOLUCION')}
            className={`px-4 py-2 text-sm border ${tipo === 'DEVOLUCION' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'}`}
          >
            Devolución (garantía)
          </button>
        </div>

        {tipo === 'CAMBIO' ? (
          <p className="text-xs text-[#8a8478] mb-6">
            No se devuelve dinero. Solo cambio por artículo de igual o mayor precio. Menudeo: 6 días.
          </p>
        ) : (
          <p className="text-xs text-[#8a8478] mb-6">
            Devolución por garantía (deschapeado). No entra ni sale dinero. Garantía: 3 meses únicamente por deschapeado. Si el producto está dañado, se da de baja del inventario.
          </p>
        )}

        <form onSubmit={buscarVenta} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Folio de la venta original..."
            value={folioBusqueda}
            onChange={(e) => setFolioBusqueda(e.target.value)}
            className="flex-1 bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-5 py-2.5 text-sm">
            Buscar
          </button>
        </form>

        {mensaje && <p className="text-red-400 text-xs mb-4">{mensaje}</p>}

        {ventaEncontrada && (
          <div className="border border-[#2a251c] p-5 mb-6">
            <p className="text-[#f5f1e8] text-sm mb-1">Folio: {ventaEncontrada.folio}</p>
            <p className="text-[#8a8478] text-xs mb-3">
              Fecha: {new Date(ventaEncontrada.fecha).toLocaleDateString('es-MX')} — {ventaEncontrada.diasTranscurridos} días transcurridos
              {ventaEncontrada.diasTranscurridos > 6 && tipo === 'CAMBIO' && (
                <span className="text-amber-400"> (fuera del plazo de 6 días de menudeo)</span>
              )}
            </p>

            <p className="text-xs text-[#8a8478] uppercase mb-2">Selecciona el producto {tipo === 'DEVOLUCION' ? 'a devolver' : 'a cambiar'}</p>
            <select
              value={productoDevueltoId}
              onChange={(e) => setProductoDevueltoId(e.target.value)}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] w-full mb-4"
            >
              <option value="">Selecciona un producto</option>
              {ventaEncontrada.detalles.map((d) => (
                <option key={d.productoId} value={d.productoId}>
                  {d.producto.sku} — {d.producto.nombre} — ${Number(d.precioUnitario).toFixed(2)}
                </option>
              ))}
            </select>

            {tipo === 'DEVOLUCION' && (
              <label className="flex items-center gap-2 text-sm text-[#f5f1e8] mb-4">
                <input type="checkbox" checked={danado} onChange={(e) => setDanado(e.target.checked)} />
                El producto está dañado (no regresa al inventario, se da de baja)
              </label>
            )}

            {tipo === 'CAMBIO' && (
              <>
                <p className="text-xs text-[#8a8478] uppercase mb-2">Producto nuevo (por el que se cambia)</p>
                <form onSubmit={buscarProductoNuevo} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="SKU del producto nuevo..."
                    value={skuNuevo}
                    onChange={(e) => setSkuNuevo(e.target.value)}
                    className="flex-1 bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-sm outline-none"
                  />
                  <button type="submit" className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                    Buscar
                  </button>
                </form>

                {productoNuevo && (
                  <div className="border border-[#c9a227] p-3 mb-4 text-sm">
                    <p className="text-[#f5f1e8]">{productoNuevo.nombre} — {productoNuevo.sku}</p>
                    <p className="text-[#8a8478] text-xs">${precioNuevo.toFixed(2)}</p>
                  </div>
                )}

                {productoDevueltoId && productoNuevo && (
                  <div className="border-t border-[#2a251c] pt-3 mb-4">
                    <p className="text-[#f5f1e8] text-sm flex justify-between">
                      <span>Precio devuelto:</span><span>${precioDevuelto.toFixed(2)}</span>
                    </p>
                    <p className="text-[#f5f1e8] text-sm flex justify-between">
                      <span>Precio nuevo:</span><span>${precioNuevo.toFixed(2)}</span>
                    </p>
                    <p className="text-[#c9a227] font-medium flex justify-between mt-1">
                      <span>Diferencia a pagar:</span><span>${diferencia.toFixed(2)}</span>
                    </p>
                  </div>
                )}

                {diferencia > 0 && (
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] w-full mb-4"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEPOSITO">Depósito</option>
                  </select>
                )}
              </>
            )}

            <button
              onClick={confirmarDevolucion}
              className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 text-sm"
            >
              Confirmar {tipo === 'DEVOLUCION' ? 'devolución' : 'cambio'}
            </button>
          </div>
        )}
      </div>

      {mostrarTicket && resultado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={() => window.print()} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setMostrarTicket(false)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
                        <TicketDevolucion devolucion={resultado} versiculo={resultado.versiculo} atendio={resultado.usuario?.nombre} />
          </div>
        </div>
      )}
    </Layout>
  );
}