require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);
const codigosPrecioRoutes = require('./routes/codigosPrecio.routes');
app.use('/api/codigos-precio', codigosPrecioRoutes);
const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor del Sistema Joyería funcionando correctamente' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});