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
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
            background: #fff;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            color: #000;
            -webkit-font-smoothing: none;
            font-smooth: never;
          }
          #ticket-imprimir {
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 auto;
            padding: 2mm !important;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${contenido.outerHTML}
      </body>
    </html>
  `);

  ventana.document.close();

  // Pequeña espera para que cargue bien el contenido antes de imprimir
  setTimeout(() => {
    ventana.focus();
    ventana.print();
    setTimeout(() => ventana.close(), 800);
  }, 300);
}