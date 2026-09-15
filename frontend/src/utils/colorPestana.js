const PALETA_COLORES = [
  { nombre: 'morado', color: '#8b5cf6' },
  { nombre: 'rosa', color: '#ec4899' },
  { nombre: 'verde', color: '#22c55e' },
  { nombre: 'azul', color: '#3b82f6' },
  { nombre: 'naranja', color: '#f97316' },
];

export function aplicarColorPestana(usuario) {
  if (!usuario) return;

  const indice = Number(usuario.id) % PALETA_COLORES.length;
  const { color } = PALETA_COLORES[indice];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="${color}" stroke="#1a1815" stroke-width="6" />
    </svg>
  `;

  const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = url;

  document.title = `Nixca - ${usuario.nombre}`;
}