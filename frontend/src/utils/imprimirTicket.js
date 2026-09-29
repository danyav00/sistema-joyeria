export function imprimirEnVentanaNueva(elementoId) {
  const contenido = document.getElementById(elementoId);

  if (!contenido) {
    alert('No se encontró el ticket para imprimir. Intenta de nuevo.');
    return;
  }

  // Clonamos el ticket y forzamos estilos críticos
  const clon = contenido.cloneNode(true);
  clon.id = 'ticket-imprimir';

  // Forzamos estilos inline en el clon
  clon.setAttribute('style', `
    width: 80mm !important;
    max-width: 80mm !important;
    margin: 0 auto !important;
    padding: 4mm !important;
    box-sizing: border-box !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    font-family: 'Courier New', Courier, monospace !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
  `);

  // Forzamos color negro en todos los hijos
  clon.querySelectorAll('*').forEach((el) => {
    el.style.color = '#000000';
    el.style.background = 'transparent';
    el.style.backgroundColor = 'transparent';
  });

  const ventana = window.open('', '_blank', 'width=400,height=700,scrollbars=yes');

  if (!ventana) {
    alert('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket - Nixca Joyería</title>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body {
            font-family: 'Courier New', Courier, monospace !important;
          }
          #ticket-imprimir {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          p, span, div, strong, b {
            color: #000000 !important;
            background: transparent !important;
          }
        </style>
      </head>
      <body>
        ${clon.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();

  // Fallback extra por si el onload del script no se ejecuta
  setTimeout(() => {
    try {
      if (ventana && !ventana.closed) {
        ventana.focus();
        ventana.print();
      }
    } catch (e) {
      console.error('Error al imprimir:', e);
    }
  }, 1200);
}