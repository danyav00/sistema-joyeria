import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import TicketDevolucion from '../components/TicketDevolucion';
import { imprimirEnVentanaNueva } from '../utils/imprimirTicket';

export default function Devoluciones() {
  const [tipo, setTipo] = useState('MENUDEO'); // MENUDEO | MAYORISTA

  // ===== MENUDEO =====
  const [folioBusqueda, setFolioBusqueda] = useState('');
  const [ventaEncontrada, setVentaEncontrada] = useState(null);
  const [productoDevueltoId, setProductoDevueltoId] = useState('');
  const [danado, setDanado] = useState(false);
  const [skuNuevo, setSkuNuevo] = useState('');
  const [productoNuevo, setProductoNuevo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  // ===== MAYORISTA =====
  const [busquedaMayorista, setBusquedaMayorista] = useState('');
  const [mayoristas, setMayoristas] = useState([]);
  const [mayoristaSeleccionado, setMayoristaSeleccionado] = useState(null);
  const [creditos, setCreditos] = useState([]);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const [productosADevolver, setProductosADevolver] = useState({});

  // ===== COMÚN =====
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (tipo === 'MAYORISTA') {
      api.get('/mayoristas').then((res) => setMayoristas(res.data));
    }
  }, [tipo]);

  // ========== MENUDEO ==========
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

  async function confirmarCambio() {
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
        danado,
        productoNuevoId: productoNuevo.id,
        metodoPago,
      });
      setResultado(res.data);
      setMostrarTicket(true);
      // reset
      setVentaEncontrada(null);
      setFolioBusqueda('');
      setProductoDevueltoId('');
      setDanado(false);
      setSkuNuevo('');
      setProductoNuevo(null);
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar el cambio');
    }
  }

  // ========== MAYORISTA ==========
  async function buscarMayorista() {
    setMensaje('');
    setMayoristaSeleccionado(null);
    setCreditos([]);
    setCreditoSeleccionado(null);
    setProductosADevolver({});

    const encontrado = mayoristas.find(
      (m) =>
        `${m.numeroCliente} — ${m.nombreCompleto}`.toLowerCase() === busquedaMayorista.toLowerCase() ||
        m.nombreCompleto.toLowerCase().includes(busquedaMayorista.toLowerCase()) ||
        m.numeroCliente.toLowerCase() === busquedaMayorista.toLowerCase()
    );

    if (!encontrado) {
      setMensaje('Mayorista no encontrado');
      return;
    }

    setMayoristaSeleccionado(encontrado);
    setCargando(true);
    try {
      const res = await api.get(`/creditos-mayorista?mayoristaId=${encontrado.id}&estado=ACTIVO`);
      setCreditos(res.data);
      if (res.data.length === 0) {
        setMensaje('Este mayorista no tiene créditos activos');
      }
    } catch (err) {
      setMensaje('Error al cargar créditos');
    } finally {
      setCargando(false);
    }
  }

  function toggleProductoDevolver(lineaId) {
    setProductosADevolver((prev) => {
      const nuevo = { ...prev };
      if (nuevo[lineaId]) {
        delete nuevo[lineaId];
      } else {
        nuevo[lineaId] = true;
      }
      return nuevo;
    });
  }

  async function confirmarDevolucionMayorista() {
    if (!creditoSeleccionado) {
      setMensaje('Selecciona un crédito');
      return;
    }
    const ids = Object.keys(productosADevolver);
    if (ids.length === 0) {
      setMensaje('Selecciona al menos un producto para devolver');
      return;
    }

    try {
      const res = await api.post('/devoluciones/mayorista', {
        creditoId: creditoSeleccionado.id,
        productosIds: ids.map(Number),
      });
      setMensaje(res.data.mensaje || 'Productos devueltos correctamente');
      // recargar créditos
      buscarMayorista();
      setCreditoSeleccionado(null);
      setProductosADevolver({});
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al devolver productos');
    }
  }

  // ========== RENDER ==========
  const productoSeleccionado = ventaEncontrada?.detalles.find((d) => d.productoId === Number(productoDevueltoId));
  const precioDevuelto = productoSeleccionado ? Number(productoSeleccionado.producto.codigoPrecio.precio) : 0;
  const precioNuevo = productoNuevo ? Number(productoNuevo.codigoPrecio.precio) : 0;
  const diferencia = Math.max(0, precioNuevo - precioDevuelto);

  return (
    <Layout>
      <div className="p-8 max-w-3xl" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Devoluciones / Cambios
        </h2>
        <p className="text-xs text-[#8a8478] mb-6">
          Menudeo: cambio por artículo de igual o mayor precio. Mayorista: devolución de productos de crédito al inventario.
        </p>

        {/* SELECTOR DE TIPO */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setTipo('MENUDEO');
              setMensaje('');
            }}
            className={`px-4 py-2 text-sm border ${
              tipo === 'MENUDEO' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'
            }`}
          >
            Menudeo
          </button>
          <button
            onClick={() => {
              setTipo('MAYORISTA');
              setMensaje('');
            }}
            className={`px-4 py-2 text-sm border ${
              tipo === 'MAYORISTA' ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'
            }`}
          >
            Mayorista
          </button>
        </div>

        {mensaje && <p className="text-amber-400 text-sm mb-4">{mensaje}</p>}

        {/* ========== MENUDEO ========== */}
        {tipo === 'MENUDEO' && (
          <>
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

            {ventaEncontrada && (
              <div className="border border-[#2a251c] p-5 mb-6">
                <p className="text-[#f5f1e8] text-sm mb-1">Folio: {ventaEncontrada.folio}</p>
                <p className="text-[#8a8478] text-xs mb-3">
                  Fecha: {new Date(ventaEncontrada.fecha).toLocaleDateString('es-MX')} — {ventaEncontrada.diasTranscurridos} días
                </p>

                <p className="text-xs text-[#8a8478] uppercase mb-2">Producto a cambiar</p>
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

                <label className="flex items-center gap-2 text-sm text-[#f5f1e8] mb-4">
                  <input type="checkbox" checked={danado} onChange={(e) => setDanado(e.target.checked)} />
                  La pieza está defectuosa/dañada (no regresa al inventario)
                </label>

                <p className="text-xs text-[#8a8478] uppercase mb-2">Producto nuevo</p>
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
                  onClick={confirmarCambio}
                  className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 text-sm"
                >
                  Confirmar cambio
                </button>
              </div>
            )}
          </>
        )}

        {/* ========== MAYORISTA ========== */}
        {tipo === 'MAYORISTA' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nombre o número de cliente del mayorista..."
                value={busquedaMayorista}
                onChange={(e) => setBusquedaMayorista(e.target.value)}
                list="lista-mayoristas-dev"
                className="flex-1 bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 text-sm outline-none"
              />
              <datalist id="lista-mayoristas-dev">
                {mayoristas.map((m) => (
                  <option key={m.id} value={`${m.numeroCliente} — ${m.nombreCompleto}`} />
                ))}
              </datalist>
              <button
                onClick={buscarMayorista}
                className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-5 py-2.5 text-sm"
              >
                Buscar
              </button>
            </div>

            {mayoristaSeleccionado && (
              <p className="text-sm text-green-400 mb-4">
                Mayorista: {mayoristaSeleccionado.nombreCompleto} ({mayoristaSeleccionado.numeroCliente})
              </p>
            )}

            {cargando && <p className="text-[#8a8478]">Cargando créditos...</p>}

            {creditos.length > 0 && (
              <div className="space-y-3 mb-6">
                {creditos.map((c) => (
                  <div
                    key={c.id}
                    className={`border p-4 cursor-pointer ${
                      creditoSeleccionado?.id === c.id ? 'border-[#c9a227]' : 'border-[#2a251c]'
                    }`}
                    onClick={() => {
                      setCreditoSeleccionado(c);
                      setProductosADevolver({});
                    }}
                  >
                    <p className="text-[#f5f1e8] text-sm">{c.folio} — Total: ${Number(c.totalCredito).toFixed(2)}</p>
                    <p className="text-[#8a8478] text-xs">
                      {c.productos.filter((p) => !p.devuelto && !p.vendido).length} productos disponibles para devolver
                    </p>
                  </div>
                ))}
              </div>
            )}

            {creditoSeleccionado && (
              <div className="border border-[#2a251c] p-5">
                <p className="text-sm text-[#f5f1e8] mb-3">
                  Selecciona los productos a devolver del crédito {creditoSeleccionado.folio}:
                </p>

                <div className="space-y-2 mb-4 max-h-64 overflow-auto">
                  {creditoSeleccionado.productos
                    .filter((p) => !p.devuelto && !p.vendido)
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 p-2 border border-[#2a251c] hover:border-[#c9a227] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!productosADevolver[p.id]}
                          onChange={() => toggleProductoDevolver(p.id)}
                        />
                        <div>
                          <p className="text-[#f5f1e8] text-sm">
                            {p.producto?.sku} — {p.producto?.nombre}
                          </p>
                          <p className="text-[#8a8478] text-xs">${Number(p.precioAlMomento).toFixed(2)}</p>
                        </div>
                      </label>
                    ))}
                </div>

                <button
                  onClick={confirmarDevolucionMayorista}
                  className="w-full bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2.5 text-sm"
                >
                  Devolver seleccionados al inventario
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TICKET MENUDEO */}
      {mostrarTicket && resultado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4 gap-4">
              <button
                onClick={() => imprimirEnVentanaNueva('ticket-imprimir')}
                className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium"
              >
                Imprimir ticket
              </button>
              <button onClick={() => setMostrarTicket(false)} className="text-[#8a8478] text-sm">
                Cerrar
              </button>
            </div>
            <TicketDevolucion
              devolucion={resultado}
              versiculo={resultado.versiculo}
              atendio={resultado.usuario?.nombre}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}