export function imprimirEnVentanaNueva(elementoId) {
  const contenido = document.getElementById(elementoId);

  if (!contenido) {
    alert('No se encontró el ticket para imprimir. Intenta de nuevo.');
    return;
  }

  // Clonamos y forzamos estilos
  const clon = contenido.cloneNode(true);
  clon.id = 'ticket-imprimir';
  clon.style.color = '#000000';
  clon.style.backgroundColor = '#ffffff';
  clon.style.background = '#ffffff';
  clon.style.width = '80mm';
  clon.style.maxWidth = '80mm';
  clon.style.margin = '0 auto';
  clon.style.padding = '4mm';
  clon.style.boxSizing = 'border-box';
  clon.style.fontFamily = "'Courier New', Courier, monospace";

  const ventana = window.open('', '_blank', 'width=400,height=700');
  
  if (!ventana) {
    alert('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes.');
    return;
  }

  ventana.document.open();
  ventana.document.write(`
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
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
          }
          #ticket-imprimir {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto;
            padding: 4mm;
            box-sizing: border-box;
            background: #fff !important;
            color: #000 !important;
          }
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

  // Esperamos a que cargue completamente antes de imprimir
  ventana.onload = () => {
    setTimeout(() => {
      ventana.focus();
      ventana.print();
      
      // Cerramos la ventana después de un tiempo
      setTimeout(() => {
        ventana.close();
      }, 1000);
    }, 300);
  };

  // Fallback por si onload no se dispara
  setTimeout(() => {
    try {
      ventana.focus();
      ventana.print();
    } catch (e) {}
  }, 800);
}