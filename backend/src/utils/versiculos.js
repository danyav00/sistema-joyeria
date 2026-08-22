const versiculos = [
  'Para Dios todo es posible. — Mateo 19:26',
  'En el momento preciso, yo el Señor haré que las cosas sucedan. — Isaías 60:22',
  'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces. — Jeremías 33:3',
  '¿Por qué te preocupas? El que te cuida nunca duerme. — Salmos 121:3-4',
  'Todo lo puedo en Cristo que me fortalece. — Filipenses 4:13',
  'No te canses de hacer lo correcto, porque la constancia también construye resultados. — Gálatas 6:9',
  'Vengan y escuchen mi consejo. Les abriré mi corazón y los haré sabios. — Proverbios 1:23',
  '¡Sé fuerte y valiente! ¡No tengas miedo ni te desanimes! Porque el Señor tu Dios te acompañará dondequiera que vayas. — Josué 1:9',
  'No nos cansemos de hacer el bien. — Gálatas 6:9',
  'El Señor es mi Pastor, nada me faltará. — Salmos 23:1',
];

function obtenerVersiculoAleatorio() {
  const indice = Math.floor(Math.random() * versiculos.length);
  return versiculos[indice];
}

module.exports = { obtenerVersiculoAleatorio };