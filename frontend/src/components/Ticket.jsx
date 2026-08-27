export default function Ticket({ venta, versiculo, tipoTicket }) {
  const fecha = new Date(venta.fecha);

  const etiquetasTipo = {
    VENTA: 'TICKET DE VENTA',
    APARTADO: 'TICKET DE APARTADO',
    ABONO: 'TICKET DE ABONO',
    CREDITO: 'TICKET DE CRÉDITO',
    DEVOLUCION: 'TICKET DE DEVOLUCIÓN',
  };

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
        {tipoTicket && (
          <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2px 0' }}>
            {etiquetasTipo[tipoTicket] || tipoTicket}
          </p>
        )}
        <p style={{ margin: 0 }}>Folio: {venta.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Atendió: {venta.usuario?.nombre}</p>
        {venta.mayorista && (
          <p style={{ margin: 0 }}>Cliente: {venta.mayorista.nombreCompleto}</p>
        )}
      </div>

       {venta.detalles && venta.detalles.length > 0 && (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cant. SKU</span>
            <span>Importe</span>
          </p>
          {venta.detalles.map((d) => {
            const tieneDescuento = d.precioConDescuento && Number(d.precioConDescuento) !== Number(d.precioUnitario);
            return (
              <p key={d.id} style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.cantidad} {d.producto?.sku} — ${Number(d.precioUnitario).toFixed(2)}</span>
                {tieneDescuento ? (
                  <span>${Number(d.precioConDescuento).toFixed(2)}</span>
                ) : (
                  <span>${Number(d.subtotal).toFixed(2)}</span>
                )}
              </p>
            );
          })}
        </div>
      )}

      {venta.subtotal !== undefined && (
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
      )}

      {venta.pagos && venta.pagos.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          {venta.pagos.map((p) => (
            <p key={p.id} style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.metodoPago}:</span><span>${Number(p.monto).toFixed(2)}</span>
            </p>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '10px' }}>"{versiculo}"</p>}
        <p style={{ marginTop: '10px', fontSize: '9px' }}>¡Gracias por su compra!</p>

        <div style={{ marginTop: '8px', fontSize: '8px', textAlign: 'left', borderTop: '1px dashed #000', paddingTop: '6px' }}>
          <p style={{ margin: '2px 0' }}>• Sin ticket no hay cambios ni garantía.</p>
          <p style={{ margin: '2px 0' }}>• La garantía es únicamente de 3 meses por deschapeado.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía por roturas.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía en anillos.</p>
          <p style={{ margin: '2px 0' }}>• Cambios por modelo o talla: 5 días, trayendo la pieza con su etiqueta.</p>
        </div>
      </div>
    </div>
  );
}