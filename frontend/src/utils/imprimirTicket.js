export function imprimirEnVentanaNueva(elementoId) {
  const contenido = document.getElementById(elementoId);
  if (!contenido) {
    alert('No se encontró el ticket para imprimir');
    return;
  }

  const ventana = window.open('', '_blank', 'width=320,height=700');
  if (!ventana) {
    alert('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio.');
    return;
  }

  // Clonamos el contenido y forzamos estilos críticos
  const clon = contenido.cloneNode(true);
  clon.style.color = '#000';
  clon.style.background = '#fff';
  clon.style.backgroundColor = '#fff';

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket</title>
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
            color: #000 !important;
            background: #fff !important;
            background-color: #fff !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: #fff !important;
            color: #000 !important;
          }
          body {
            font-family: 'Courier New', Courier, monospace !important;
            -webkit-font-smoothing: none;
          }
          #ticket-imprimir {
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
            background: #fff !important;
            color: #000 !important;
          }
          /* Forzar todos los textos a negro */
          p, span, div {
            color: #000 !important;
          }
        </style>
      </head>
      <body>
        ${clon.outerHTML}
      </body>
    </html>
  `);

  ventana.document.close();

  setTimeout(() => {
    ventana.focus();
    ventana.print();
    setTimeout(() => ventana.close(), 1000);
  }, 400);
}