export default function Ticket({ venta, versiculo }) {
  const fecha = new Date(venta.fecha);

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
        <p style={{ margin: 0 }}>Folio: {venta.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Atendió: {venta.usuario?.nombre}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
        {venta.detalles?.map((d) => (
          <div key={d.id} style={{ marginBottom: '4px' }}>
            <p style={{ margin: 0 }}>{d.producto?.nombre}</p>
            <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
              <span>{d.cantidad} x ${Number(d.precioUnitario).toFixed(2)}</span>
              <span>${Number(d.subtotal).toFixed(2)}</span>
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span><span>${Number(venta.subtotal).toFixed(2)}</span>
        </p>
        {Number(venta.descuento) > 0 && (
          <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
            <span>Descuento:</span><span>-${Number(venta.descuento).toFixed(2)}</span>
          </p>
        )}
        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>TOTAL:</span><span>${Number(venta.total).toFixed(2)}</span>
        </p>
      </div>

      <div style={{ marginBottom: '10px' }}>
        {venta.pagos?.map((p) => (
          <p key={p.id} style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
            <span>{p.metodoPago}:</span><span>${Number(p.monto).toFixed(2)}</span>
          </p>
        ))}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <p style={{ fontStyle: 'italic', fontSize: '10px' }}>"{versiculo}"</p>
        <p style={{ marginTop: '10px', fontSize: '9px' }}>¡Gracias por su compra!</p>
      </div>
    </div>
  );
}