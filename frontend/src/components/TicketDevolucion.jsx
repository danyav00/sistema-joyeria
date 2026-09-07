export default function TicketDevolucion({ devolucion, atendio, versiculo }) {
  const fecha = new Date(devolucion.fecha);
  const esCambio = devolucion.tipo === 'CAMBIO';

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
        <p style={{ fontSize: '9px', margin: 0 }}>Celular/WhatsApp: 477 523 7223</p>
        <p style={{ fontSize: '9px', margin: 0 }}>IG: joyerias.nixca</p>
        <p style={{ fontSize: '9px', margin: '0 0 4px 0' }}>FB: joyerías nixca</p>
        <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2px 0' }}>
          {esCambio ? 'TICKET DE CAMBIO' : 'TICKET DE DEVOLUCIÓN (GARANTÍA)'}
        </p>
        <p style={{ margin: 0 }}>Folio: {devolucion.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Atendió: {atendio || devolucion.usuario?.nombre || '—'}</p>
        <p style={{ margin: 0 }}>Venta original: {devolucion.ventaOriginal?.folio}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>
          Producto {esCambio ? 'devuelto' : 'en garantía'}:
        </p>
        <p style={{ margin: '0 0 3px 0', fontSize: '9px' }}>
          {devolucion.productoDevuelto?.sku} — {devolucion.productoDevuelto?.nombre}
        </p>
        {!esCambio && devolucion.danado && (
          <p style={{ margin: '0 0 3px 0', fontSize: '8px', color: '#a00' }}>Producto dañado — dado de baja del inventario</p>
        )}

        {esCambio && (
          <>
            <p style={{ margin: '8px 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Producto nuevo entregado:</p>
            <p style={{ margin: '0 0 3px 0', fontSize: '9px' }}>
              {devolucion.productoNuevo?.sku} — {devolucion.productoNuevo?.nombre}
            </p>
          </>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        {esCambio && Number(devolucion.diferenciaPagada) > 0 ? (
          <>
            <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>DIFERENCIA PAGADA:</span><span>${Number(devolucion.diferenciaPagada).toFixed(2)}</span>
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px' }}>Método de pago: {devolucion.metodoPago}</p>
          </>
        ) : esCambio ? (
          <p style={{ margin: 0, fontSize: '9px' }}>Cambio sin costo adicional (igual o menor precio).</p>
        ) : (
          <p style={{ margin: 0, fontSize: '9px' }}>Sin costo. No entra ni sale dinero por esta garantía.</p>
        )}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <div style={{ fontSize: '8px', textAlign: 'left', marginBottom: '8px' }}>
          <p style={{ margin: '2px 0' }}>
            • En caso de cambio, no se puede hacer un segundo cambio; en caso de garantía, conserve su ticket para su garantía por tres meses.
          </p>
        </div>

              <p style={{ fontSize: '9px' }}>¡Gracias por su compra!</p>

        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '10px', marginTop: '8px' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}