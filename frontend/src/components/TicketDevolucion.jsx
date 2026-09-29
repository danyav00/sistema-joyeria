export default function TicketDevolucion({ devolucion, atendio, versiculo }) {
  const fecha = new Date(devolucion.fecha);

  return (
    <div id="ticket-imprimir" style={{
      width: '7.9cm',
      minHeight: '18cm',
      padding: '0.3cm',
      fontFamily: "'Courier New', monospace",
      fontSize: '13px',
      color: '#000',
      background: '#fff',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>NIXCA JOYERÍA</p>
        <p style={{ fontSize: '11px', margin: 0 }}>Celular/WhatsApp: 477 523 7223</p>
        <p style={{ fontSize: '11px', margin: 0 }}>IG: joyerias.nixca</p>
        <p style={{ fontSize: '11px', margin: '0 0 6px 0' }}>FB: joyerías nixca</p>
        <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '4px 0', textTransform: 'uppercase' }}>
          {devolucion.danado ? 'TICKET DE CAMBIO POR GARANTÍA' : 'TICKET DE CAMBIO'}
        </p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Folio: {devolucion.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Atendió: {atendio || devolucion.usuario?.nombre || '—'}</p>
        <p style={{ margin: 0 }}>Venta original: {devolucion.ventaOriginal?.folio}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '8px 0' }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold' }}>Producto devuelto:</p>
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>
          {devolucion.productoDevuelto?.sku} — {devolucion.productoDevuelto?.nombre}
        </p>
        {devolucion.danado && (
          <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 'bold' }}>Producto dañado — dado de baja del inventario</p>
        )}

        <p style={{ margin: '8px 0 6px 0', fontSize: '11px', fontWeight: 'bold' }}>Producto nuevo entregado:</p>
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>
          {devolucion.productoNuevo?.sku} — {devolucion.productoNuevo?.nombre}
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        {Number(devolucion.diferenciaPagada) > 0 ? (
          <>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase' }}>
              <span>DIFERENCIA PAGADA:</span><span>${Number(devolucion.diferenciaPagada).toFixed(2)}</span>
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>Método de pago: {devolucion.metodoPago}</p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold' }}>Cambio sin costo adicional (igual o menor precio).</p>
        )}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <div style={{ fontSize: '10px', textAlign: 'left', marginBottom: '10px', color: '#555', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>
            • En caso de cambio, no se puede hacer un segundo cambio; en caso de garantía, conserve su ticket por tres meses.
          </p>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>¡Gracias por su compra!</p>
        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '8px', color: '#555' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}
