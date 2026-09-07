import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Ticket from '../components/Ticket';
import logo from '../assets/logo.png';

function redondear(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

function etiquetaMaterial(producto) {
  if (producto.material === 'PLATA') return ' Plata';
  if (producto.material === 'ORO') {
    return producto.tipo?.toLowerCase().includes('broquel') ? ' 10K' : ' Oro';
  }
  return '';
}

function nombreConMaterial(producto) {
  return `${producto.nombre}${etiquetaMaterial(producto)}`;
}

export default function Ventas() {
  const [turno, setTurno] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mayoristas, setMayoristas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pagos, setPagos] = useState([{ metodoPago: 'EFECTIVO', monto: '' }]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [busquedaSku, setBusquedaSku] = useState('');
  const [mensajeBusqueda, setMensajeBusqueda] = useState('');

  const [tipoDescuento, setTipoDescuento] = useState('NORMAL');
  const [mayoristaSeleccionado, setMayoristaSeleccionado] = useState(null);
  const [busquedaMayorista, setBusquedaMayorista] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/turnos/activo'),
      api.get('/productos?estado=DISPONIBLE'),
      api.get('/mayoristas'),
    ])
      .then(([resTurno, resProductos, resMayoristas]) => {
        setTurno(resTurno.data);
        setProductos(resProductos.data);
        setMayoristas(resMayoristas.data);
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

  function precioConDescuento(producto) {
    const base = Number(producto.codigoPrecio.precio);
    if (producto.tieneDescuentoAplicado) return base;

    if (tipoDescuento === 'MAYORISTA') {
      return redondear(base * 0.5);
    }
    if (tipoDescuento === 'LOCATARIO') {
      return redondear(base * 0.8);
    }
    return base;
  }

  function agregarAlCarrito(producto) {
    const yaExiste = carrito.find((item) => item.productoId === producto.id);
    if (yaExiste) {
      if (yaExiste.cantidad >= producto.existencia) return;
      setCarrito(carrito.map((item) =>
        item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        nombre: nombreConMaterial(producto),
        sku: producto.sku,
        existenciaMaxima: producto.existencia,
        tieneDescuentoAplicado: producto.tieneDescuentoAplicado,
        precioBase: Number(producto.codigoPrecio.precio),
        precio: precioConDescuento(producto),
        cantidad: 1,
      }]);
    }
  }

  function buscarPorSku(e) {
    e.preventDefault();
    setMensajeBusqueda('');
    const skuLimpio = busquedaSku.trim().toLowerCase();
    if (!skuLimpio) return;

    const encontrado = productos.find((p) => p.sku.toLowerCase() === skuLimpio);

    if (!encontrado) {
      setMensajeBusqueda('Producto no encontrado o no disponible');
      return;
    }

    agregarAlCarrito(encontrado);
    setBusquedaSku('');
  }

  function quitarDelCarrito(productoId) {
    setCarrito(carrito.filter((item) => item.productoId !== productoId));
  }

  function actualizarCantidadCarrito(productoId, cantidadTexto) {
    setCarrito(carrito.map((item) =>
      item.productoId === productoId ? { ...item, cantidad: cantidadTexto } : item
    ));
  }

  function validarCantidadCarrito(productoId) {
    setCarrito(carrito.map((item) => {
      if (item.productoId !== productoId) return item;
      let cantidad = parseInt(item.cantidad, 10);
      if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
      if (cantidad > item.existenciaMaxima) cantidad = item.existenciaMaxima;
      return { ...item, cantidad };
    }));
  }

  function seleccionarMayorista(mayorista) {
    setMayoristaSeleccionado(mayorista);
    setTipoDescuento('MAYORISTA');
    setBusquedaMayorista(`${mayorista.numeroCliente} — ${mayorista.nombreCompleto}`);
  }

  function cambiarTipoDescuento(nuevoTipo) {
    setTipoDescuento(nuevoTipo);
    if (nuevoTipo !== 'MAYORISTA') {
      setMayoristaSeleccionado(null);
      setBusquedaMayorista('');
    }
  }

  useEffect(() => {
    setCarrito((prev) => prev.map((item) => {
      const producto = productos.find((p) => p.id === item.productoId);
      if (!producto) return item;
      return { ...item, precio: precioConDescuento(producto) };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoDescuento]);

  const total = redondear(carrito.reduce((suma, item) => suma + item.precio * (Number(item.cantidad) || 0), 0));
  const totalPagos = redondear(pagos.reduce((suma, p) => suma + (Number(p.monto) || 0), 0));
  const diferencia = redondear(totalPagos - total);

  function actualizarPago(index, campo, valor) {
    const nuevosPagos = [...pagos];
    nuevosPagos[index][campo] = valor;
    setPagos(nuevosPagos);
  }

  function agregarPago() {
    setPagos([...pagos, { metodoPago: 'EFECTIVO', monto: '' }]);
  }

  function quitarPago(index) {
    if (pagos.length <= 1) return;
    setPagos(pagos.filter((_, i) => i !== index));
  }

  const productosFiltrados = productos.filter((p) => {
    const texto = busquedaSku.trim().toLowerCase();
    if (!texto) return true;
    return p.sku.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto);
  });

  async function confirmarVenta() {
    setMensaje('');
    try {
      let pagosAEnviar = pagos.map((p) => ({ metodoPago: p.metodoPago, monto: redondear(Number(p.monto) || 0) }));
      if (diferencia > 0) {
        let restante = diferencia;
        for (let i = pagosAEnviar.length - 1; i >= 0 && restante > 0; i--) {
          const reduccion = Math.min(pagosAEnviar[i].monto, restante);
          pagosAEnviar[i].monto = redondear(pagosAEnviar[i].monto - reduccion);
          restante = redondear(restante - reduccion);
        }
        pagosAEnviar = pagosAEnviar.filter((p) => p.monto > 0);
      }

      const resVenta = await api.post('/ventas', {
        turnoId: turno.id,
        tipoVenta: tipoDescuento === 'MAYORISTA' ? 'MAYOREO' : 'MENUDEO',
        tipoDescuento,
        mayoristaId: mayoristaSeleccionado ? mayoristaSeleccionado.id : undefined,
        productos: carrito.map((item) => ({ productoId: item.productoId, cantidad: Number(item.cantidad) })),
        pagos: pagosAEnviar,
        descuento: 0,
      });

      if (mayoristaSeleccionado) {
        await api.post(`/mayoristas/${mayoristaSeleccionado.id}/compra`, { ventaId: resVenta.data.id });
      }

      const resTicket = await api.post('/tickets', {
        ventaId: resVenta.data.id,
        tipo: 'DIGITAL',
      });

      setTicketData(resTicket.data);
      setMensaje('Venta registrada con exito');
      setCarrito([]);
      setPagos([{ metodoPago: 'EFECTIVO', monto: '' }]);
      setTipoDescuento('NORMAL');
      setMayoristaSeleccionado(null);
      setBusquedaMayorista('');
      const res = await api.get('/productos?estado=DISPONIBLE');
      setProductos(res.data);
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al registrar la venta');
    }
  }

  function imprimirTicket() {
    window.print();
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
              <img src={logo} alt="Nixca Joyería" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Punto de Venta
            </h2>
          </div>

          <div className="mb-4">
            <p className="text-xs text-[#8a8478] uppercase mb-2">Tipo de venta</p>
            <div className="flex gap-2 mb-2">
              {['NORMAL', 'MAYORISTA', 'LOCATARIO'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => cambiarTipoDescuento(tipo)}
                  className={`px-3 py-1.5 text-xs border ${
                    tipoDescuento === tipo ? 'border-[#c9a227] text-[#c9a227]' : 'border-[#2a251c] text-[#8a8478]'
                  }`}
                >
                  {tipo === 'NORMAL' ? 'Venta normal' : tipo === 'MAYORISTA' ? 'Mayoreo (-50%)' : 'Locatario (-20%)'}
                </button>
              ))}
            </div>

            {tipoDescuento !== 'NORMAL' && (
              <p className="text-xs text-amber-400 border-l-2 border-amber-400 pl-2 mb-2">
                ⚠ Se aplicará descuento a los productos sin "+OFF" ({tipoDescuento === 'MAYORISTA' ? '50%' : '20%'}).
              </p>
            )}

            {tipoDescuento === 'MAYORISTA' && (
              <div>
                <input
                  type="text"
                  placeholder="Buscar mayorista por nombre o número..."
                  value={busquedaMayorista}
                  onChange={(e) => setBusquedaMayorista(e.target.value)}
                  list="lista-mayoristas-venta"
                  className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-sm outline-none"
                />
                <datalist id="lista-mayoristas-venta">
                  {mayoristas.map((m) => (
                    <option key={m.id} value={`${m.numeroCliente} — ${m.nombreCompleto}`} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => {
                    const encontrado = mayoristas.find((m) => `${m.numeroCliente} — ${m.nombreCompleto}` === busquedaMayorista);
                    if (encontrado) seleccionarMayorista(encontrado);
                  }}
                  className="text-xs text-[#c9a227] hover:underline mt-1"
                >
                  Confirmar mayorista
                </button>
                {mayoristaSeleccionado && (
                  <p className="text-xs text-green-400 mt-1">Seleccionado: {mayoristaSeleccionado.nombreCompleto}</p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={buscarPorSku} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Escanea, escribe el SKU o busca por nombre..."
              value={busquedaSku}
              onChange={(e) => setBusquedaSku(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-5 py-2.5 text-sm">
              Agregar
            </button>
          </form>
          {mensajeBusqueda && <p className="text-red-400 text-xs -mt-2 mb-4">{mensajeBusqueda}</p>}

          <div className="grid grid-cols-2 gap-3">
            {productosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => agregarAlCarrito(p)}
                className="border border-[#2a251c] hover:border-[#c9a227] p-4 text-left transition-colors"
              >
                <p className="text-[#f5f1e8] text-sm">
                  {nombreConMaterial(p)} {p.tieneDescuentoAplicado && <span className="text-amber-400 text-xs">(OFF)</span>}
                </p>
                <p className="text-[#8a8478] text-xs">{p.sku} • {p.material} • Existencia: {p.existencia}</p>
                <p className="text-[#c9a227] mt-1">${precioConDescuento(p).toFixed(2)}</p>
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
                  <div className="flex-1">
                    <p className="text-[#f5f1e8]">{item.nombre}</p>
                    <p className="text-[#8a8478] text-xs">{item.sku}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.existenciaMaxima}
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidadCarrito(item.productoId, e.target.value)}
                        onBlur={() => validarCantidadCarrito(item.productoId)}
                        onFocus={(e) => e.target.select()}
                        className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-0.5 w-12"
                      />
                      <p className="text-[#8a8478] text-xs">
                        x ${item.precio.toFixed(2)} = ${redondear(item.precio * (Number(item.cantidad) || 0)).toFixed(2)}
                      </p>
                    </div>
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
              <div key={index} className="flex gap-2 items-center">
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
                {pagos.length > 1 && (
                  <button onClick={() => quitarPago(index)} className="text-red-400 text-xs">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={agregarPago} className="text-[#8a8478] text-xs hover:text-[#c9a227]">
              + Agregar otro método
            </button>
          </div>

          <p className="text-xs mb-3">
            <span className="text-[#8a8478]">Pagado: ${totalPagos.toFixed(2)}</span>
            {diferencia > 0.004 && (
              <span className="text-green-400 font-bold uppercase"> (SOBRAN ${diferencia.toFixed(2)})</span>
            )}
            {diferencia < -0.004 && (
              <span className="text-red-400 uppercase"> (FALTAN ${Math.abs(diferencia).toFixed(2)})</span>
            )}
          </p>

          {mensaje && <p className="text-xs text-amber-400 mb-3">{mensaje}</p>}

          <button
            onClick={confirmarVenta}
            disabled={carrito.length === 0 || totalPagos < total - 0.004 || (tipoDescuento === 'MAYORISTA' && !mayoristaSeleccionado)}
            className="w-full bg-[#c9a227] hover:bg-[#e0b52c] text-[#1a1815] font-medium py-2.5 text-sm disabled:opacity-40 disabled:hover:bg-[#c9a227] transition-colors"
          >
            Confirmar venta
          </button>
        </div>
      </div>

      {ticketData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:relative">
          <div className="bg-[#1a1815] p-4 max-h-[90vh] overflow-auto print:bg-white print:p-0 print:max-h-none">
            <div className="print:hidden flex justify-between items-center mb-4 gap-4">
              <button onClick={imprimirTicket} className="bg-[#c9a227] text-[#1a1815] px-4 py-2 text-sm font-medium">
                Imprimir ticket
              </button>
              <button onClick={() => setTicketData(null)} className="text-[#8a8478] text-sm hover:text-[#f5f1e8]">
                Cerrar
              </button>
            </div>
            <Ticket venta={ticketData.venta} versiculo={ticketData.versiculo} tipoTicket="VENTA" />
          </div>
        </div>
      )}
    </Layout>
  );
}