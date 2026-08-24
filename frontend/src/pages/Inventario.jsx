import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    sku: '', codigoPrecioId: '', nombre: '', descripcion: '', material: 'ORO', tipo: '', existencia: '',
  });

  const [ajustando, setAjustando] = useState(null);
  const [cantidadAjuste, setCantidadAjuste] = useState('');

  function cargarDatos() {
    setCargando(true);
    Promise.all([api.get('/productos'), api.get('/codigos-precio')])
      .then(([resProductos, resCodigos]) => {
        setProductos(resProductos.data);
        setCodigos(resCodigos.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearProducto(e) {
    e.preventDefault();
    try {
      await api.post('/productos', form);
      setForm({ sku: '', codigoPrecioId: '', nombre: '', descripcion: '', material: 'ORO', tipo: '', existencia: '' });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear el producto');
    }
  }

  async function ajustarInventario(productoId) {
    if (!cantidadAjuste) return;
    try {
      await api.patch(`/productos/${productoId}/ajuste`, {
        cantidad: Number(cantidadAjuste),
        nota: 'Ajuste manual desde inventario',
      });
      setAjustando(null);
      setCantidadAjuste('');
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al ajustar inventario');
    }
  }

  const estadoColor = {
    DISPONIBLE: 'text-green-400',
    APARTADO: 'text-amber-400',
    VENDIDO: 'text-[#8a8478]',
    CANCELADO: 'text-red-400',
  };

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Inventario
          </h2>
          {usuario?.rol === 'ADMINISTRADOR' && (
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
            >
              {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
            </button>
          )}
        </div>

        {mostrarForm && (
          <form onSubmit={crearProducto} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />

            <select value={form.codigoPrecioId} onChange={(e) => setForm({ ...form, codigoPrecioId: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required>
              <option value="">Código de precio</option>
              {codigos.map((c) => (
                <option key={c.id} value={c.id}>{c.codigo} — ${c.precio}</option>
              ))}
            </select>

            <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" required />

            <input placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" />

            <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]">
                            <option value="ORO">Oro</option>
              <option value="PLATA">Plata</option>
              <option value="ORO_LAMINADO">Oro laminado</option>
              <option value="ACERO">Acero</option>
              <option value="OTRO">Otro</option>
            </select>

            <input placeholder="Tipo (Anillos, Aretes...)" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />

            <input type="number" placeholder="Existencia inicial" value={form.existencia} onChange={(e) => setForm({ ...form, existencia: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" />

            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2">
              Guardar producto
            </button>
          </form>
        )}

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
                <th className="pb-3">SKU</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Material</th>
                <th className="pb-3">Precio</th>
                <th className="pb-3">Existencia</th>
                <th className="pb-3">Estado</th>
                {usuario?.rol === 'ADMINISTRADOR' && <th className="pb-3">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-[#2a251c]/50">
                  <td className="py-3 text-[#f5f1e8]">{p.sku}</td>
                  <td className="py-3 text-[#f5f1e8]">{p.nombre}</td>
                  <td className="py-3 text-[#8a8478]">{p.material}</td>
                  <td className="py-3 text-[#c9a227]">${Number(p.codigoPrecio.precio).toFixed(2)}</td>
                  <td className="py-3 text-[#f5f1e8]">{p.existencia}</td>
                  <td className={`py-3 ${estadoColor[p.estado]}`}>{p.estado}</td>
                  {usuario?.rol === 'ADMINISTRADOR' && (
                    <td className="py-3">
                      {ajustando === p.id ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            placeholder="+/-"
                            value={cantidadAjuste}
                            onChange={(e) => setCantidadAjuste(e.target.value)}
                            className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-16"
                          />
                          <button onClick={() => ajustarInventario(p.id)} className="text-xs text-[#c9a227]">✓</button>
                          <button onClick={() => { setAjustando(null); setCantidadAjuste(''); }} className="text-xs text-red-400">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setAjustando(p.id)} className="text-xs text-[#c9a227] hover:underline">
                          Ajustar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}