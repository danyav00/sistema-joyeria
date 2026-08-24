import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [form, setForm] = useState({ nombre: '', usuario: '', contrasena: '', rol: 'EMPLEADO' });
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [formPass, setFormPass] = useState({ contrasenaActual: '', contrasenaNueva: '' });
  const [mensajePass, setMensajePass] = useState('');
  
  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre: '', rol: '' });

  function cargarDatos() {
    setCargando(true);
    api.get('/usuarios').then((res) => setUsuarios(res.data)).finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearUsuario(e) {
    e.preventDefault();
    setMensaje('');
    try {
      await api.post('/usuarios', form);
      setForm({ nombre: '', usuario: '', contrasena: '', rol: 'EMPLEADO' });
      setMostrarForm(false);
      cargarDatos();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al crear el usuario');
    }
  }
    async function cambiarMiContrasena(e) {
    e.preventDefault();
    setMensajePass('');
    try {
      await api.put('/usuarios/cambiar-contrasena', formPass);
      setMensajePass('Contraseña actualizada correctamente');
      setFormPass({ contrasenaActual: '', contrasenaNueva: '' });
    } catch (err) {
      setMensajePass(err.response?.data?.error || 'Error al cambiar la contraseña');
    }
  }

  async function cambiarActivo(u) {
    try {
      await api.put(`/usuarios/${u.id}`, { nombre: u.nombre, rol: u.rol, activo: !u.activo });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar el usuario');
    }
  }
  
  function iniciarEdicion(u) {
    setEditando(u.id);
    setFormEdicion({ nombre: u.nombre, rol: u.rol });
  }

  async function guardarEdicion(u) {
    try {
      await api.put(`/usuarios/${u.id}`, { nombre: formEdicion.nombre, rol: formEdicion.rol, activo: u.activo });
      setEditando(null);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al editar el usuario');
    }
  }
  
  async function resetearContrasena(u) {
    const nuevaContrasena = prompt(`Escribe la nueva contraseña para ${u.nombre} (mínimo 6 caracteres):`);
    if (!nuevaContrasena) return;
    try {
      const res = await api.put(`/usuarios/${u.id}/resetear-contrasena`, { contrasenaNueva: nuevaContrasena });
      alert(res.data.mensaje);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al restablecer la contraseña');
    }
  }

  return (
    <Layout>
      <div className="p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
               <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Usuarios
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarCambioPass(!mostrarCambioPass)}
              className="border border-[#c9a227] text-[#c9a227] px-4 py-2 text-sm hover:bg-[#c9a227]/10 transition-colors"
            >
              {mostrarCambioPass ? 'Cancelar' : 'Cambiar mi contraseña'}
            </button>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium px-4 py-2 text-sm transition-colors"
            >
              {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
            </button>
          </div>
        </div>

        {mostrarCambioPass && (
          <form onSubmit={cambiarMiContrasena} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
            <input type="password" placeholder="Contraseña actual" value={formPass.contrasenaActual}
              onChange={(e) => setFormPass({ ...formPass, contrasenaActual: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input type="password" placeholder="Contraseña nueva" value={formPass.contrasenaNueva}
              onChange={(e) => setFormPass({ ...formPass, contrasenaNueva: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            {mensajePass && <p className="text-amber-400 text-xs col-span-2">{mensajePass}</p>}
            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2">
              Actualizar contraseña
            </button>
          </form>
        )}

        {mostrarForm && (
          <form onSubmit={crearUsuario} className="border border-[#2a251c] p-5 mb-6 grid grid-cols-2 gap-4">
            <input placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2" required />
            <input placeholder="Usuario" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <input type="password" placeholder="Contraseña" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              className="bg-transparent border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227]" required />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] px-3 py-2 text-sm outline-none focus:border-[#c9a227] col-span-2">
              <option value="EMPLEADO">Empleado</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="SOCIO">Socio</option>
            </select>
            {mensaje && <p className="text-red-400 text-xs col-span-2">{mensaje}</p>}
            <button type="submit" className="bg-[#c9a227] hover:bg-[#b8931f] text-[#1a1815] font-medium py-2 text-sm col-span-2">
              Crear usuario
            </button>
          </form>
        )}

        {cargando ? (
          <p className="text-[#8a8478]">Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8a8478] uppercase text-xs border-b border-[#2a251c]">
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Usuario</th>
                <th className="pb-3">Rol</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Acción</th>
              </tr>
            </thead>
            <tbody>
                           {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-[#2a251c]/50">
                  {editando === u.id ? (
                    <>
                      <td className="py-2">
                        <input
                          value={formEdicion.nombre}
                          onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                          className="bg-transparent border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-3 text-[#8a8478]">{u.usuario}</td>
                      <td className="py-2">
                        <select
                          value={formEdicion.rol}
                          onChange={(e) => setFormEdicion({ ...formEdicion, rol: e.target.value })}
                          className="bg-[#1a1815] border border-[#3a352c] text-[#f5f1e8] text-xs px-2 py-1"
                        >
                          <option value="EMPLEADO">Empleado</option>
                          <option value="ADMINISTRADOR">Administrador</option>
                          <option value="SOCIO">Socio</option>
                        </select>
                      </td>
                      <td className={`py-3 ${u.activo ? 'text-green-400' : 'text-red-400'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </td>
                      <td className="py-3 flex gap-3">
                        <button onClick={() => guardarEdicion(u)} className="text-xs text-[#c9a227]">Guardar</button>
                        <button onClick={() => setEditando(null)} className="text-xs text-red-400">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 text-[#f5f1e8]">{u.nombre}</td>
                      <td className="py-3 text-[#8a8478]">{u.usuario}</td>
                      <td className="py-3 text-[#8a8478]">{u.rol}</td>
                      <td className={`py-3 ${u.activo ? 'text-green-400' : 'text-red-400'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </td>
                      <td className="py-3 flex gap-3">
                        <button onClick={() => cambiarActivo(u)} className="text-xs text-[#c9a227] hover:underline">
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => iniciarEdicion(u)} className="text-xs text-[#8a8478] hover:text-[#c9a227] hover:underline">
                          Editar
                        </button>
                        <button onClick={() => resetearContrasena(u)} className="text-xs text-[#8a8478] hover:text-[#c9a227] hover:underline">
                          Restablecer contraseña
                        </button>
                      </td>
                    </>
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