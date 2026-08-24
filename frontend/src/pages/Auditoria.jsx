import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Auditoria() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/auditoria')
      .then((res) => setRegistros(res.data))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h2 className="text-2xl text-[#f5f1e8] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Auditoría
        </h2>

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : registros.length === 0 ? (
          <p className="text-[#8a8478]">Sin registros de auditoría aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Usuario</th>
                <th className="pb-3">Acción</th>
                <th className="pb-3">Tabla</th>
                <th className="pb-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-b border-[#2a251c]/50">
                  <td className="py-3 text-[#8a8478] whitespace-nowrap">
                    {new Date(r.fecha).toLocaleString('es-MX')}
                  </td>
                  <td className="py-3 text-[#f5f1e8]">{r.usuario?.nombre}</td>
                  <td className="py-3 text-[#c9a227]">{r.accion}</td>
                  <td className="py-3 text-[#8a8478]">{r.tablaAfectada}</td>
                  <td className="py-3 text-[#8a8478] text-xs max-w-xs truncate" title={r.detalle}>
                    {r.detalle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}