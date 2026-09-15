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

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket</title>
        <meta charset="UTF-8" />
        <style>
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${contenido.outerHTML}
      </body>
    </html>
  `);
  ventana.document.close();

  ventana.onload = () => {
    ventana.focus();
    ventana.print();
    setTimeout(() => ventana.close(), 500);
  };
}