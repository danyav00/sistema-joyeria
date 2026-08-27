export default function TicketDevolucion({ devolucion }) {
  const fecha = new Date(devolucion.fecha);

  return (
    <div
      id="ticket-imprimir"
      style={{
        width: '7.9cm',
        minHeight: '18cm',
        padding: '0.3cm',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        color: '#000',
        background: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>NIXCA JOYERÍA</p>
        <p style={{ fontSize: '9px', margin: 0 }}>Plaza Galerías Las Torres, Isla 7</p>
        <p style={{ fontSize: '9px', margin: '0 0 4px 0' }}>Tel: 4778063756</p>
        <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2px 0' }}>
          TICKET DE CAMBIO / DEVOLUCIÓN
        </p>
        <p style={{ margin: 0 }}>Folio: {devolucion.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Venta original: {devolucion.ventaOriginal?.folio}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Producto devuelto:</p>
        <p style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{devolucion.productoDevuelto?.sku} — {devolucion.productoDevuelto?.nombre}</span>
        </p>

        <p style={{ margin: '8px 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Producto nuevo entregado:</p>
        <p style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{devolucion.productoNuevo?.sku} — {devolucion.productoNuevo?.nombre}</span>
        </p>
      </div>

      <div style={{ marginBottom: '10px' }}>
        {Number(devolucion.diferenciaPagada) > 0 ? (
          <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>DIFERENCIA PAGADA:</span><span>${Number(devolucion.diferenciaPagada).toFixed(2)}</span>
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '9px' }}>Cambio sin costo adicional (igual o menor precio).</p>
        )}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <p style={{ fontSize: '9px' }}>¡Gracias por su compra!</p>
        <div style={{ marginTop: '8px', fontSize: '8px', textAlign: 'left', borderTop: '1px dashed #000', paddingTop: '6px' }}>
          <p style={{ margin: '2px 0' }}>• Sin ticket no hay cambios ni garantía.</p>
          <p style={{ margin: '2px 0' }}>• La garantía es únicamente de 3 meses por deschapeado.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía por roturas.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía en anillos.</p>
        </div>
      </div>
    </div>
  );
}