import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setDatos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <Layout>
        <div className="p-8 text-[#8a8478]">Cargando...</div>
      </Layout>
    );
  }

  if (!datos) {
    return (
      <Layout>
        <div className="p-8 text-red-400">Error al cargar el dashboard</div>
      </Layout>
    );
  }

  const tarjetas = datos.esEmpleado
    ? [
        { label: 'Mis ventas de hoy (turno)', valor: `$${Number(datos.ventasHoy || 0).toFixed(2)}` },
        { label: 'Productos en catálogo', valor: datos.totalProductos },
        { label: 'Apartados activos', valor: datos.apartadosActivos },
      ]
    : [
        { label: 'Ventas de hoy', valor: `$${Number(datos.ventasHoy || 0).toFixed(2)}` },
        { label: 'Ventas del mes', valor: `$${Number(datos.ventasMes || 0).toFixed(2)}` },
        { label: 'Gastos del mes', valor: `$${Number(datos.gastosMes || 0).toFixed(2)}` },
        { label: 'Productos en catálogo', valor: datos.totalProductos },
        { label: 'Apartados activos', valor: datos.apartadosActivos },
        { label: 'Mayoristas activos', valor: datos.mayoristasActivos },
      ];

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Dashboard
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {tarjetas.map((t) => (
            <div key={t.label} className="border border-[#2a251c] p-5">
              <p className="text-xs text-[#8a8478] uppercase tracking-wide mb-2">{t.label}</p>
              <p className="text-2xl text-[#c9a227]">{t.valor}</p>
            </div>
          ))}
        </div>

        {/* Solo administradores ven estas secciones */}
        {!datos.esEmpleado && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-[#2a251c] p-5">
              <h3 className="text-sm text-[#f5f1e8] uppercase tracking-wide mb-4">Productos más vendidos</h3>
              {!datos.productosMasVendidos || datos.productosMasVendidos.length === 0 ? (
                <p className="text-[#8a8478] text-sm">Sin ventas registradas aún</p>
              ) : (
                <ul className="space-y-2">
                  {datos.productosMasVendidos.map((p) => (
                    <li key={p.nombre} className="flex justify-between text-sm">
                      <span className="text-[#f5f1e8]">{p.nombre}</span>
                      <span className="text-[#8a8478]">{p.cantidad} vendidos</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-[#2a251c] p-5">
              <h3 className="text-sm text-[#f5f1e8] uppercase tracking-wide mb-4">Ventas por método de pago</h3>
              {!datos.ventasPorMetodoPago || Object.keys(datos.ventasPorMetodoPago).length === 0 ? (
                <p className="text-[#8a8478] text-sm">Sin ventas registradas aún</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(datos.ventasPorMetodoPago).map(([metodo, monto]) => (
                    <li key={metodo} className="flex justify-between text-sm">
                      <span className="text-[#f5f1e8]">{metodo}</span>
                      <span className="text-[#8a8478]">${Number(monto).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}