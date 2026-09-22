function etiquetaMaterial(material) {
  if (material === 'PLATA') return 'Plata';
  if (material === 'ORO') return 'Oro';
  if (material === 'ORO_LAMINADO') return 'Oro Laminado';
  return material || '';
}

export default function Ticket({ venta, versiculo, tipoTicket, montoRecibido, cambio }) {
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
        fontSize: '12px',
        color: '#000',
        background: '#fff',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#000' }}>NIXCA JOYERÍA</p>
        <p style={{ fontSize: '10px', margin: 0, color: '#000' }}>Celular/WhatsApp: 477 523 7223</p>
        <p style={{ fontSize: '10px', margin: 0, color: '#000' }}>IG: joyerias.nixca</p>
        <p style={{ fontSize: '10px', margin: '0 0 4px 0', color: '#000' }}>FB: joyerías nixca</p>
        {tipoTicket && (
          <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2px 0', color: '#000' }}>
            {etiquetasTipo[tipoTicket] || tipoTicket}
          </p>
        )}
        <p style={{ margin: 0, fontWeight: 'bold', color: '#000' }}>Folio: {venta.folio}</p>
        <p style={{ margin: 0, color: '#000' }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#000' }}>Atendió: {venta.usuario?.nombre}</p>
        {venta.tipoVenta === 'LOCATARIO' && (
          <p style={{ margin: 0, fontWeight: 'bold', color: '#000' }}>VENTA DE LOCATARIO</p>
        )}
        {venta.mayorista && (
          <p style={{ margin: 0, color: '#000' }}>Cliente: {venta.mayorista.nombreCompleto}</p>
        )}
      </div>

      {venta.detalles && venta.detalles.length > 0 && (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
            <span>Cant. SKU</span>
            <span>Importe</span>
          </p>
          {venta.detalles.map((d) => {
            const tieneDescuento = d.precioConDescuento && Number(d.precioConDescuento) !== Number(d.precioUnitario);
            return (
              <div key={d.id} style={{ marginBottom: '3px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                  <span>{d.cantidad} {d.producto?.sku} — ${Number(d.precioUnitario).toFixed(2)}</span>
                  {tieneDescuento ? (
                    <span>${Number(d.precioConDescuento).toFixed(2)}</span>
                  ) : (
                    <span>${Number(d.subtotal).toFixed(2)}</span>
                  )}
                </p>
                {d.producto?.material && (
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#000' }}>Material: {etiquetaMaterial(d.producto.material)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {venta.total !== undefined && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>
            <span>TOTAL:</span><span>${Number(venta.total).toFixed(2)}</span>
          </p>
        </div>
      )}

      {venta.pagos && venta.pagos.length > 0 && (
        <div style={{ marginBottom: '6px' }}>
          {venta.pagos.map((p) => (
            <p key={p.id} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold' }}>
              <span>{p.metodoPago}:</span><span>${Number(p.monto).toFixed(2)}</span>
            </p>
          ))}
        </div>
      )}

      {(montoRecibido !== undefined || Number(cambio) > 0) && (
        <div style={{ marginBottom: '10px', borderTop: '1px dashed #000', paddingTop: '4px' }}>
          {montoRecibido !== undefined && (
            <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold' }}>
              <span>Pagó con:</span><span>${Number(montoRecibido).toFixed(2)}</span>
            </p>
          )}
          {Number(cambio) > 0 && (
            <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold', fontSize: '13px' }}>
              <span>CAMBIO:</span><span>${Number(cambio).toFixed(2)}</span>
            </p>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <div style={{ fontSize: '9px', textAlign: 'left', marginBottom: '8px', color: '#000', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>• Sin ticket no hay cambios ni garantía.</p>
          <p style={{ margin: '2px 0' }}>• La garantía es únicamente de 3 meses por deschapeado.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía por roturas.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía en anillos.</p>
          <p style={{ margin: '2px 0' }}>• Cambios por modelo o talla: 5 días, trayendo la pieza con su etiqueta.</p>
        </div>

        <p style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>¡Gracias por su compra!</p>

        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '11px', marginTop: '8px', color: '#000' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}