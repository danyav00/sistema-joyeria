const axios = require('axios');

const API_URL = 'https://sistema-joyeria-production.up.railway.app/api';
const USUARIO = 'Xcaret_admin';
const CONTRASENA = 'TU_CONTRASEÑA_AQUI';

async function main() {
  const loginRes = await axios.post(`${API_URL}/usuarios/login`, {
    usuario: USUARIO,
    contrasena: CONTRASENA,
  });
  const token = loginRes.data.token;
  console.log('Login exitoso, iniciando carga de codigos ordinarios...');

  for (let precio = 1000; precio <= 4000; precio += 50) {
    const codigo = String(precio);
    try {
      await axios.post(
        `${API_URL}/codigos-precio`,
        { codigo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Codigo ${codigo} creado correctamente`);
    } catch (error) {
      console.log(`Error en codigo ${codigo}:`, error.response?.data?.error || error.message);
    }
  }

  console.log('Carga completa.');
}

main();