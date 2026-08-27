import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function CreditosMayorista() {
  const [creditos, setCreditos] = useState([]);
  const [mayoristas, setMayoristas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [busquedaMayorista, setBusquedaMayorista] = useState('');

  const [form, setForm] = useState({ mayoristaId: '', productosSeleccionados: {} });
  const [busquedaProducto, setBusquedaProducto] = useState('');

  const [liquidando, setLiquidando] = useState(null);
  const [formLiquidacion, setFormLiquidacion] = useState({
    totalVendido: '',
    productosDevueltos: [],
    metodoPago: 'EFECTIVO',
  });

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

  function toggleProducto(productoId, maxExistencia) {
    setForm((prev) => {
      const nuevo = { ...prev.productosSeleccionados };
      if (nuevo[productoId]) {
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
      await api.post('/creditos-mayorista', {
        mayoristaId: form.mayoristaId,
        productos: productosArray,
      });
      setForm({ mayoristaId: '', mayoristaTexto: '', productosSeleccionados: {} });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al abrir el credito');
    }
  }

  function toggleDevuelto(productoId) {
    setFormLiquidacion((prev) => {
      const yaEsta = prev.productosDevueltos.includes(productoId);
      return {
        ...prev,
        productosDevueltos: yaEsta
          ? prev.productosDevueltos.filter((id) => id !== productoId)
          : [...prev.productosDevueltos, productoId],
      };
    });
  }

  async function liquidar(credito) {
    try {
      const turnoRes = await api.get('/turnos/activo');
      if (!turnoRes.data) {
        alert('Necesitas un turno abierto para liquidar un credito. Ve a Punto de Venta.');
        return;
      }

      const totalNoDevuelto = credito.productos
        .filter((p) => !formLiquidacion.productosDevueltos.includes(p.productoId))
        .reduce((suma, p) => suma + Number(p.precioAlMomento), 0);

      const totalAPagar = totalNoDevuelto;

      await api.put(`/creditos-mayorista/${credito.id}/liquidar`, {
        totalVendido: Number(formLiquidacion.totalVendido),
        turnoId: turnoRes.data.id,
        productosDevueltos: formLiquidacion.productosDevueltos,
        pagos: [{ metodoPago: formLiquidacion.metodoPago, monto: totalAPagar }],
      });

      setLiquidando(null);
      setFormLiquidacion({ totalVendido: '', productosDevueltos: [], metodoPago: 'EFECTIVO' });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al liquidar el credito');
    }
  }

  const totalSeleccionado = Object.entries(form.productosSeleccionados).reduce((suma, [productoId, cantidad]) => {
    const producto = productos.find((p) => p.id === Number(productoId));
    return producto ? suma + Number(producto.codigoPrecio.precio) * cantidad : suma;
  }, 0);

  const productosFiltrados = productos.filter((p) => {
    const texto = busquedaProducto.toLowerCase();
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
          <form onSubmit={abrirCredito} className="border border-[#2a251c] p-5 mb-6">
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

            <p className="text-xs text-[#8a8478] uppercase mb-2">Selecciona los productos (mínimo $2,000 en total, solo Oro Laminado)</p>
            <input
              type="text"
              placeholder="Buscar por SKU o nombre..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="w-full bg-transparent border border-[#3a352c] focus:border-[#c9a227] text-[#f5f1e8] px-3 py-2 text-sm outline-none mb-2"
            />
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-auto">
              {productosFiltrados.map((p) => {
                const seleccionado = form.productosSeleccionados[p.id];
                return (
                  <div
                    key={p.id}
                    className={`border p-3 text-sm flex items-center gap-2 ${
                      seleccionado ? 'border-[#c9a227]' : 'border-[#2a251c]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionado !== undefined}
                      onChange={() => toggleProducto(p.id, p.existencia)}
                    />
                    <div className="flex-1">
                      <p className="text-[#f5f1e8]">{p.nombre} — {p.sku}</p>
                      <p className="text-[#8a8478] text-xs">
                        {p.material} — ${Number(p.codigoPrecio.precio).toFixed(2)} — Existencia: {p.existencia}
                      </p>
                    </div>
                    {seleccionado !== undefined && (
                      <input
                        type="number"
                        min="1"
                        max={p.existencia}
                        value={seleccionado}
                        onChange={(e) => actualizarCantidadProducto(p.id, e.target.value)}
                        onBlur={() => validarCantidadProducto(p.id, p.existencia)}
                        onFocus={(e) => e.target.select()}
                        className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-14"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[#f5f1e8] mb-3">Total seleccionado: <span className="text-[#c9a227]">${totalSeleccionado.toFixed(2)}</span></p>

            {mensaje && <p className="text-red-400 text-xs mb-3">{mensaje}</p>}

            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm w-full">
              Abrir crédito
            </button>
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
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-[#f5f1e8] text-sm">{c.folio} — {c.mayorista?.nombreCompleto}</p>
                    <p className="text-[#8a8478] text-xs">
                      Total: ${Number(c.totalCredito).toFixed(2)} • Límite: {new Date(c.fechaLimite).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <span className={`text-xs ${estadoColor[c.estado]}`}>{c.estado}</span>
                </div>

                <div className="text-xs text-[#8a8478] mb-2">
                  {c.productos.map((p) => (
                    <p key={p.id}>
                      {p.producto.nombre} — {p.producto.material} — ${Number(p.precioAlMomento).toFixed(2)}
                      {p.devuelto && <span className="text-green-400"> (devuelto)</span>}
                    </p>
                  ))}
                </div>

                {c.estado === 'ACTIVO' && (
                  liquidando === c.id ? (
                    <div className="border-t border-[#2a251c] pt-3 mt-3">
                      <p className="text-xs text-[#8a8478] uppercase mb-2">Liquidar crédito</p>
                      <input
                        type="number"
                        placeholder="Total vendido"
                        value={formLiquidacion.totalVendido}
                        onChange={(e) => setFormLiquidacion({ ...formLiquidacion, totalVendido: e.target.value })}
                        className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] w-full mb-3"
                      />

                      <p className="text-xs text-[#8a8478] mb-2">Marca los productos que el mayorista regresa (solo Oro Laminado se acepta):</p>
                      <div className="space-y-1 mb-3">
                        {c.productos.map((p) => (
                          <label key={p.id} className="flex items-center gap-2 text-xs text-[#f5f1e8]">
                            <input
                              type="checkbox"
                              checked={formLiquidacion.productosDevueltos.includes(p.productoId)}
                              onChange={() => toggleDevuelto(p.productoId)}
                            />
                            {p.producto.nombre} — {p.producto.material} — ${Number(p.precioAlMomento).toFixed(2)}
                          </label>
                        ))}
                      </div>

                      <select
                        value={formLiquidacion.metodoPago}
                        onChange={(e) => setFormLiquidacion({ ...formLiquidacion, metodoPago: e.target.value })}
                        className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] w-full mb-3"
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="DEPOSITO">Depósito</option>
                      </select>

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
                    <button onClick={() => setLiquidando(c.id)} className="text-xs text-[#c9a227] hover:underline">
                      Liquidar
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}