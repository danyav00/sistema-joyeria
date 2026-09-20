require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middlewares/auth');


const app = express();

app.use(cors({
  origin: ['https://sistema-joyeria-tan.vercel.app', 'http://localhost:5173'],
}));
app.use(express.json());
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);
const codigosPrecioRoutes = require('./routes/codigosPrecio.routes');
app.use('/api/codigos-precio', codigosPrecioRoutes);
const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);
const turnosRoutes = require('./routes/turnos.routes');
app.use('/api/turnos', turnosRoutes);
const ventasRoutes = require('./routes/ventas.routes');
app.use('/api/ventas', ventasRoutes);
const apartadosRoutes = require('./routes/apartados.routes');
app.use('/api/apartados', apartadosRoutes);
const mayoristasRoutes = require('./routes/mayoristas.routes');
app.use('/api/mayoristas', mayoristasRoutes);
const creditosMayoristaRoutes = require('./routes/creditosMayorista.routes');
app.use('/api/creditos-mayorista', creditosMayoristaRoutes);
const gastosRoutes = require('./routes/gastos.routes');
app.use('/api/gastos', gastosRoutes);
const cortesRoutes = require('./routes/cortes.routes');
app.use('/api/cortes', cortesRoutes);
const reportesRoutes = require('./routes/reportes.routes');
app.use('/api/reportes', reportesRoutes);
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);
const auditoriaRoutes = require('./routes/auditoria.routes');
app.use('/api/auditoria', auditoriaRoutes);
const ticketsRoutes = require('./routes/tickets.routes');
app.use('/api/tickets', ticketsRoutes);
const { obtenerDashboard } = require('./controllers/dashboard.controller');
app.get('/dashboard', authMiddleware, obtenerDashboard);
const devolucionesRoutes = require('./routes/devoluciones.routes');
app.use('/api/devoluciones', devolucionesRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor del Sistema Joyería funcionando correctamente' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});