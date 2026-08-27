import { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Devoluciones() {
  const [folioBusqueda, setFolioBusqueda] = useState('');
  const [ventaEncontrada, setVentaEncontrada] = useState(null);
  const [productoDevueltoId, setProductoDevueltoId] = useState('');
  const [skuNuevo, setSkuNuevo] = useState('');
  const [productoNuevo, setProductoNuevo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState(null);

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
    if (!productoNuevo) {
      setMensaje('Busca el producto nuevo primero');
      return;
    }

    try {
      const res = await api.post('/devoluciones', {
        ventaOriginalId: ventaEncontrada.id,
        productoDevueltoId: Number(productoDevueltoId),
        productoNuevoId: productoNuevo.id,
        metodoPago,
      });
      setResultado(res.data);
      setVentaEncontrada(null);
      setFolioBusqueda('');
      setProductoDevueltoId('');
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
        <p className="text-xs text-[#8a8478] mb-6">
          No se devuelve dinero, solo cambio por artículo de igual o mayor precio. Menudeo: 6 días. Garantía: 3 meses solo por deschapeado.
        </p>

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
              {ventaEncontrada.diasTranscurridos > 6 && (
                <span className="text-amber-400"> (fuera del plazo de 6 días de menudeo)</span>
              )}
            </p>

            <p className="text-xs text-[#8a8478] uppercase mb-2">Selecciona el producto a devolver</p>
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

            <button
              onClick={confirmarDevolucion}
              className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 text-sm"
            >
              Confirmar cambio
            </button>
          </div>
        )}

        {resultado && (
          <div className="border border-green-400 p-4 text-sm">
            <p className="text-green-400 font-medium mb-2">✓ Cambio registrado — Folio: {resultado.folio}</p>
            <p className="text-[#f5f1e8]">Devuelto: {resultado.productoDevuelto.nombre}</p>
            <p className="text-[#f5f1e8]">Entregado: {resultado.productoNuevo.nombre}</p>
            <p className="text-[#c9a227]">Diferencia pagada: ${Number(resultado.diferenciaPagada).toFixed(2)}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}