export function imprimirEnVentanaNueva(elementoId) {
  const contenido = document.getElementById(elementoId);
  if (!contenido) {
    alert('No se encontró el ticket para imprimir');
    return;
  }

  const ventana = window.open('', '_blank', 'width=350,height=700');
  if (!ventana) {
    alert('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio.');
    return;
  }

  ventana.document.open();
  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket</title>
        <meta charset="UTF-8" />
        <style>
          @page { margin: 0; }
          html, body {
            margin: 0;
            padding: 0;
            filter: none !important;
            -webkit-filter: none !important;
            background: #fff !important;
          }
        </style>
      </head>
      <body>
        ${contenido.outerHTML}
      </body>
    </html>
  `);
  ventana.document.close();

  setTimeout(() => {
    ventana.focus();
    ventana.print();
    setTimeout(() => ventana.close(), 300);
  }, 300);
}