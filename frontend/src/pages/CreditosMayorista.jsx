import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import TicketCredito from '../components/TicketCredito';

function nombreConMaterial(producto) {
  if (producto.material === 'PLATA') return `${producto.nombre} Plata`;
  if (producto.material === 'ORO') {
    return producto.tipo?.toLowerCase().includes('broquel') ? `${producto.nombre} 10K` : `${producto.nombre} Oro`;
  }
  return producto.nombre;
}

export default function CreditosMayorista() {
  const [creditos, setCreditos] = useState([]);
  const [mayoristas, setMayoristas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [busquedaMayorista, setBusquedaMayorista] = useState('');

  const [form, setForm] = useState({ mayoristaId: '', mayoristaTexto: '', productosSeleccionados: {} });
  const [busquedaProducto, setBusquedaProducto] = useState('');

  const [liquidando, setLiquidando] = useState(null);
  const [seleccionLiquidacion, setSeleccionLiquidacion] = useState({});
  const [metodoPagoLiquidacion, setMetodoPagoLiquidacion] = useState('EFECTIVO');
  const [mensajeLiquidacion, setMensajeLiquidacion] = useState('');
  const [llevaNuevo, setLlevaNuevo] = useState(false);
  const [productosNuevoCredito, setProductosNuevoCredito] = useState({});
  const [busquedaProductoNuevo, setBusquedaProductoNuevo] = useState('');

  const [ticketCredito, setTicketCredito] = useState(null);
  const [expandido, setExpandido] = useState({});

  function toggleExpandido(creditoId) {
    setExpandido((prev) => ({ ...prev, [creditoId]: !prev[creditoId] }));
  }

  function cargarDatos() {
    setCargando(true);
    Promise.all([
      api.get('/creditos-mayorista'),
      api.get('/mayoristas'),
      api.get('/productos?estado=DISPONIBLE&material=ORO_LAMINADO'),
    ])
      .then(([resCreditos, resMayoristas, resProductos]) => {
        setCreditos(resCreditos.data);
        setMayoristas(resMayoristas.data);
        setProductos(resProductos.data);
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function toggleProducto(productoId) {
    setForm((prev) => {
      const nuevo = { ...prev.productosSeleccionados };
      if (nuevo[productoId] !== undefined) {
        delete nuevo[productoId];
      } else {
        nuevo[productoId] = 1;
      }
      return { ...prev, productosSeleccionados: nuevo };
    });
  }

  function actualizarCantidadProducto(productoId, cantidadTexto) {
    setForm((prev) => ({
      ...prev,
      productosSeleccionados: { ...prev.productosSeleccionados, [productoId]: cantidadTexto },
    }));
  }

  function validarCantidadProducto(productoId, maxExistencia) {
    setForm((prev) => {
      let cantidadFinal = parseInt(prev.productosSeleccionados[productoId], 10);
      if (isNaN(cantidadFinal) || cantidadFinal < 1) cantidadFinal = 1;
      if (cantidadFinal > maxExistencia) cantidadFinal = maxExistencia;
      return {
        ...prev,
        productosSeleccionados: { ...prev.productosSeleccionados, [productoId]: cantidadFinal },
      };
    });
  }

  async function abrirCredito(e) {
    e.preventDefault();
    setMensaje('');
    try {
      const productosArray = Object.entries(form.productosSeleccionados).flatMap(
        ([productoId, cantidad]) => Array(cantidad).fill({ productoId: Number(productoId) })
      );
      const res = await api.post('/creditos-mayorista', {
        mayoristaId: form.mayoristaId,
        productos: productosArray,
      });
      setForm({ mayoristaId: '', mayoristaTexto: '', productosSeleccionados: {} });
      setMostrarForm(false);
      setTicketCredito({ credito: res.data, tipo: 'ABIERTO', versiculo: res.data.versiculo, atendio: res.data.usuario?.nombre });
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al abrir el credito');
    }
  }

  function iniciarLiquidacion(credito) {
    setLiquidando(credito.id);
    const inicial = {};
    credito.productos.forEach((p) => { inicial[p.id] = 'PENDIENTE'; });
    setSeleccionLiquidacion(inicial);
    setMensajeLiquidacion('');
    setLlevaNuevo(false);
    setProductosNuevoCredito({});
  }

  function marcarEstadoPieza(lineaId, estado) {
    setSeleccionLiquidacion((prev) => ({ ...prev, [lineaId]: prev[lineaId] === estado ? 'PENDIENTE' : estado }));
  }

  function toggleProductoNuevoCredito(productoId) {
    setProductosNuevoCredito((prev) => {
      const nuevo = { ...prev };
      if (nuevo[productoId] !== undefined) {
        delete nuevo[productoId];
      } else {
        nuevo[productoId] = 1;
      }
      return nuevo;
    });
  }

  function actualizarCantidadProductoNuevo(productoId, cantidadTexto) {
    setProductosNuevoCredito((prev) => ({ ...prev, [productoId]: cantidadTexto }));
  }

  function validarCantidadProductoNuevo(productoId, maxExistencia) {
    setProductosNuevoCredito((prev) => {
      let cantidadFinal = parseInt(prev[productoId], 10);
      if (isNaN(cantidadFinal) || cantidadFinal < 1) cantidadFinal = 1;
      if (cantidadFinal > maxExistencia) cantidadFinal = maxExistencia;
      return { ...prev, [productoId]: cantidadFinal };
    });
  }

  async function liquidar(credito) {
    setMensajeLiquidacion('');
    try {
      const turnoRes = await api.get('/turnos/activo');
      if (!turnoRes.data) {
        setMensajeLiquidacion('Necesitas un turno abierto para liquidar un credito. Ve a Punto de Venta.');
        return;
      }

      const productosVendidos = Object.entries(seleccionLiquidacion)
        .filter(([, estado]) => estado === 'VENDIDO')
        .map(([lineaId]) => Number(lineaId));

      const productosDevueltos = Object.entries(seleccionLiquidacion)
        .filter(([, estado]) => estado === 'DEVUELTO')
        .map(([lineaId]) => Number(lineaId));

      const totalAPagar = credito.productos
        .filter((p) => !productosDevueltos.includes(p.id))
        .reduce((suma, p) => suma + Number(p.precioAlMomento), 0);

      const productosNuevoArray = llevaNuevo
        ? Object.entries(productosNuevoCredito).flatMap(
            ([productoId, cantidad]) => Array(Number(cantidad)).fill({ productoId: Number(productoId) })
          )
        : [];

      const res = await api.put(`/creditos-mayorista/${credito.id}/liquidar`, {
        productosVendidos,
        productosDevueltos,
        turnoId: turnoRes.data.id,
        pagos: [{ metodoPago: metodoPagoLiquidacion, monto: totalAPagar }],
        productosNuevoCredito: productosNuevoArray,
      });

      setTicketCredito({
        credito: res.data,
        tipo: 'LIQUIDADO',
        versiculo: res.data.versiculo,
        atendio: res.data.usuario?.nombre,
        creditoNuevo: res.data.creditoNuevo,
      });
      setLiquidando(null);
      cargarDatos();
    } catch (err) {
      setMensajeLiquidacion(err.response?.data?.error || 'Error al liquidar el credito');
    }
  }

  const totalSeleccionado = Object.entries(form.productosSeleccionados).reduce((suma, [productoId, cantidad]) => {
    const producto = productos.find((p) => p.id === Number(productoId));
    if (!producto) return suma;
    const precioConDescuento = Math.round(Number(producto.codigoPrecio.precio) * 0.5 * 100) / 100;
    return suma + precioConDescuento * (Number(cantidad) || 0);
  }, 0);

  const totalNuevoCredito = Object.entries(productosNuevoCredito).reduce((suma, [productoId, cantidad]) => {
    const producto = productos.find((p) => p.id === Number(productoId));
    if (!producto) return suma;
    const precioConDescuento = Math.round(Number(producto.codigoPrecio.precio) * 0.5 * 100) / 100;
    return suma + precioConDescuento * (Number(cantidad) || 0);
  }, 0);

  const productosFiltrados = productos.filter((p) => {
    const texto = busquedaProducto.toLowerCase();
    return p.sku.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto);
  });

  const productosFiltradosNuevo = productos.filter((p) => {
    const texto = busquedaProductoNuevo.toLowerCase();
    return p.sku.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto);
  });

  const estadoColor = {
    ACTIVO: 'text-amber-400',
    LIQUIDADO: 'text-green-400',
    CANCELADO: 'text-red-400',
  };

  const creditosFiltrados = creditos.filter((c) => {
    const texto = busquedaMayorista.toLowerCase();
    return (
      c.mayorista?.nombreCompleto.toLowerCase().includes(texto) ||
      c.mayorista?.numeroCliente.toLowerCase().includes(texto)
    );
  });

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Créditos de Mayorista
          </h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo crédito'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={abrirCredito} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                list="lista-mayoristas"
                placeholder="Escribe para buscar un mayorista..."
                value={form.mayoristaTexto || ''}
                onChange={(e) => {
                  const texto = e.target.value;
                  const encontrado = mayoristas.find((m) => `${m.numeroCliente} — ${m.nombreCompleto}` === texto);
                  setForm({ ...form, mayoristaTexto: texto, mayoristaId: encontrado ? encontrado.id : '' });
                }}
                className="bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-sm outline-none w-full mb-4"
                required
              />
              <datalist id="lista-mayoristas">
                {mayoristas.map((m) => (
                  <option key={m.id} value={`${m.numeroCliente} — ${m.nombreCompleto}`} />
                ))}
              </datalist>

              <p className="text-xs text-[#8a8478] uppercase mb-2">Buscar productos (solo Oro Laminado, mínimo $2,000 con 50% descuento)</p>
              <input
                type="text"
                placeholder="Buscar por SKU o nombre..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-sm outline-none mb-2"
              />
              <div className="space-y-2 max-h-80 overflow-auto">
                {productosFiltrados.map((p) => {
                  const seleccionado = form.productosSeleccionados[p.id];
                  const precioConDescuento = Math.round(Number(p.codigoPrecio.precio) * 0.5 * 100) / 100;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleProducto(p.id)}
                      className={`w-full text-left border p-3 text-sm transition-colors ${
                        seleccionado !== undefined ? 'border-[#c9a227]' : 'border-[#2a251c] hover:border-[#c9a227]'
                      }`}
                    >
                      <p className="text-[#f5f1e8]">{nombreConMaterial(p)}</p>
                      <p className="text-[#8a8478] text-xs">{p.sku} • Existencia: {p.existencia}</p>
                      <p className="text-[#c9a227] mt-1">${precioConDescuento.toFixed(2)} <span className="text-[#8a8478] text-xs line-through ml-1">${Number(p.codigoPrecio.precio).toFixed(2)}</span></p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-[#2a251c] p-4 h-fit">
              <h3 className="text-sm text-[#f5f1e8] uppercase tracking-wide mb-3">Carrito del crédito</h3>
              {Object.keys(form.productosSeleccionados).length === 0 ? (
                <p className="text-[#8a8478] text-sm">Sin productos</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {Object.entries(form.productosSeleccionados).map(([productoId, cantidad]) => {
                    const producto = productos.find((p) => p.id === Number(productoId));
                    if (!producto) return null;
                    const precioConDescuento = Math.round(Number(producto.codigoPrecio.precio) * 0.5 * 100) / 100;
                    return (
                      <div key={productoId} className="text-sm">
                        <p className="text-[#f5f1e8]">{nombreConMaterial(producto)}</p>
                        <p className="text-[#8a8478] text-xs">{producto.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min="1"
                            max={producto.existencia}
                            value={cantidad}
                            onChange={(e) => actualizarCantidadProducto(productoId, e.target.value)}
                            onBlur={() => validarCantidadProducto(productoId, producto.existencia)}
                            onFocus={(e) => e.target.select()}
                            className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-14"
                          />
                          <p className="text-[#8a8478] text-xs">
                            x ${precioConDescuento.toFixed(2)} = ${(precioConDescuento * (Number(cantidad) || 0)).toFixed(2)}
                          </p>
                          <button type="button" onClick={() => toggleProducto(Number(productoId))} className="text-red-400 text-xs ml-auto">
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-[#2a251c] pt-3">
                <p className="text-[#f5f1e8] flex justify-between mb-3">
                  <span>Total</span>
                  <span className="text-[#c9a227]">${totalSeleccionado.toFixed(2)}</span>
                </p>

                {mensaje && <p className="text-red-400 text-xs mb-3">{mensaje}</p>}

                <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm w-full">
                  Abrir crédito
                </button>
              </div>
            </div>
          </form>
        )}

        <input
          type="text"
          placeholder="Buscar por nombre o número de cliente del mayorista..."
          value={busquedaMayorista}
          onChange={(e) => setBusquedaMayorista(e.target.value)}
          className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 text-sm outline-none mb-4"
        />

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <div className="space-y-4">
            {creditosFiltrados.map((c) => (
              <div key={c.id} className="border border-[#2a251c] p-4">
                <button
                  onClick={() => toggleExpandido(c.id)}
                  className="flex justify-between items-center w-full text-left mb-2"
                >
                  <div>
                    <p className="text-[#f5f1e8] text-sm">{c.folio} — {c.mayorista?.nombreCompleto}</p>
                    <p className="text-[#8a8478] text-xs">
                      Total: ${Number(c.totalCredito).toFixed(2)} • {c.productos.length} producto(s) • Límite: {new Date(c.fechaLimite).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${estadoColor[c.estado]}`}>{c.estado}</span>
                    <span className="text-[#8a8478] text-xs">{expandido[c.id] ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandido[c.id] && (
                  <div className="text-xs text-[#8a8478] mb-2 max-h-40 overflow-auto border-t border-[#2a251c] pt-2">
                    {c.productos.map((p) => (
                      <p key={p.id}>
                        {p.producto.sku} — {p.producto.nombre} — ${Number(p.precioAlMomento).toFixed(2)}
                        {p.devuelto && <span className="text-green-400"> (devuelto)</span>}
                        {p.vendido && <span className="text-blue-400"> (vendido)</span>}
                      </p>
                    ))}
                  </div>
                )}

                {expandido[c.id] && c.estado === 'ACTIVO' && (
                  liquidando === c.id ? (
                    <div className="border-t border-[#2a251c] pt-3 mt-3">
                      <p className="text-xs text-[#8a8478] uppercase mb-2">
                        Marca el estado de cada pieza (Vendida / Devuelta / sin marcar = se la queda y paga)
                      </p>
                      <div className="space-y-2 mb-3">
                        {c.productos.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs border border-[#2a251c] p-2">
                            <span className="text-[#f5f1e8]">{p.producto.sku} — ${Number(p.precioAlMomento).toFixed(2)}</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => marcarEstadoPieza(p.id, 'VENDIDO')}
                                className={`px-2 py-1 border ${seleccionLiquidacion[p.id] === 'VENDIDO' ? 'border-blue-400 text-blue-400' : 'border-[#3a352c] text-[#8a8478]'}`}
                              >
                                Vendida
                              </button>
                              <button
                                type="button"
                                onClick={() => marcarEstadoPieza(p.id, 'DEVUELTO')}
                                className={`px-2 py-1 border ${seleccionLiquidacion[p.id] === 'DEVUELTO' ? 'border-green-400 text-green-400' : 'border-[#3a352c] text-[#8a8478]'}`}
                              >
                                Devolver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <select
                        value={metodoPagoLiquidacion}
                        onChange={(e) => setMetodoPagoLiquidacion(e.target.value)}
                        className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] w-full mb-3"
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="DEPOSITO">Depósito</option>
                      </select>

                      <label className="flex items-center gap-2 text-xs text-[#f5f1e8] mb-3">
                        <input type="checkbox" checked={llevaNuevo} onChange={(e) => setLlevaNuevo(e.target.checked)} />
                        El mayorista se lleva piezas nuevas en este mismo momento (abre un crédito nuevo)
                      </label>

                      {llevaNuevo && (
                        <div className="border border-[#2a251c] p-3 mb-3">
                          <p className="text-xs text-[#8a8478] uppercase mb-2">Buscar piezas nuevas (Oro Laminado, 50% descuento)</p>
                          <input
                            type="text"
                            placeholder="Buscar por SKU o nombre..."
                            value={busquedaProductoNuevo}
                            onChange={(e) => setBusquedaProductoNuevo(e.target.value)}
                            className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-xs outline-none mb-2"
                          />
                          <div className="space-y-2 max-h-48 overflow-auto mb-3">
                            {productosFiltradosNuevo.map((p) => {
                              const seleccionado = productosNuevoCredito[p.id];
                              const precioConDescuento = Math.round(Number(p.codigoPrecio.precio) * 0.5 * 100) / 100;
                              return (
                                <div
                                  key={p.id}
                                  className={`border p-2 text-xs flex items-center gap-2 ${
                                    seleccionado !== undefined ? 'border-[#c9a227]' : 'border-[#2a251c]'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={seleccionado !== undefined}
                                    onChange={() => toggleProductoNuevoCredito(p.id)}
                                  />
                                  <div className="flex-1">
                                    <p className="text-[#f5f1e8]">{nombreConMaterial(p)} — {p.sku}</p>
                                    <p className="text-[#8a8478]">${precioConDescuento.toFixed(2)} — Existencia: {p.existencia}</p>
                                  </div>
                                  {seleccionado !== undefined && (
                                    <input
                                      type="number"
                                      min="1"
                                      max={p.existencia}
                                      value={seleccionado}
                                      onChange={(e) => actualizarCantidadProductoNuevo(p.id, e.target.value)}
                                      onBlur={() => validarCantidadProductoNuevo(p.id, p.existencia)}
                                      onFocus={(e) => e.target.select()}
                                      className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-12"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-[#c9a227]">Nuevo crédito: ${totalNuevoCredito.toFixed(2)}</p>
                        </div>
                      )}

                      {mensajeLiquidacion && <p className="text-red-400 text-xs mb-3">{mensajeLiquidacion}</p>}

                      <div className="flex gap-3">
                        <button onClick={() => liquidar(c)} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                          Confirmar liquidación
                        </button>
                        <button onClick={() => setLiquidando(null)} className="text-red-400 text-sm">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => iniciarLiquidacion(c)} className="text-xs text-[#c9a227] hover:underline">
                      Liquidar
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {ticketCredito && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={() => window.print()} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setTicketCredito(null)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
            <TicketCredito credito={ticketCredito.credito} tipo={ticketCredito.tipo} versiculo={ticketCredito.versiculo} atendio={ticketCredito.atendio} />
            {ticketCredito.creditoNuevo && (
              <div className="mt-4 print:mt-0 print:break-before-page">
                <p className="text-xs text-[#c9a227] mb-2 print:hidden">-- Crédito nuevo generado --</p>
                <TicketCredito credito={ticketCredito.creditoNuevo} tipo="ABIERTO" versiculo={ticketCredito.versiculo} atendio={ticketCredito.atendio} />
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}