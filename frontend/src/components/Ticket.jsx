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
        {tipoTicket && (
          <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '4px 0', textTransform: 'uppercase' }}>
            {etiquetasTipo[tipoTicket] || tipoTicket}
          </p>
        )}
        <p style={{ margin: 0, fontWeight: 'bold' }}>Folio: {venta.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Atendió: {venta.usuario?.nombre}</p>
      </div>

      {venta.detalles?.length > 0 && (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '8px 0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cant. SKU</span><span>Importe</span>
          </p>
          {venta.detalles.map((d) => (
            <div key={d.id} style={{ marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.cantidad} {d.producto?.sku} — ${Number(d.precioUnitario).toFixed(2)}</span>
                <span>${Number(d.subtotal).toFixed(2)}</span>
              </p>
              {d.producto?.material && (
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>Material: {etiquetaMaterial(d.producto.material)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {venta.total !== undefined && (
        <p style={{ margin: '10px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>
          <span>TOTAL:</span><span>${Number(venta.total).toFixed(2)}</span>
        </p>
      )}

      {venta.pagos?.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          {venta.pagos.map((p) => (
            <p key={p.id} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{p.metodoPago}:</span><span>${Number(p.monto).toFixed(2)}</span>
            </p>
          ))}
        </div>
      )}

      {(montoRecibido !== undefined || Number(cambio) > 0) && (
        <div style={{ marginBottom: '12px', borderTop: '1px dashed #000', paddingTop: '6px' }}>
          {montoRecibido !== undefined && (
            <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Pagó con:</span><span>${Number(montoRecibido).toFixed(2)}</span>
            </p>
          )}
          {Number(cambio) > 0 && (
            <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase' }}>
              <span>CAMBIO:</span><span>${Number(cambio).toFixed(2)}</span>
            </p>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <div style={{ fontSize: '10px', textAlign: 'left', marginBottom: '10px', color: '#555', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>• Sin ticket no hay cambios ni garantía.</p>
          <p style={{ margin: '2px 0' }}>• Garantía: 3 meses por deschapeado.</p>
          <p style={{ margin: '2px 0' }}>• No hay garantía por roturas ni en anillos.</p>
          <p style={{ margin: '2px 0' }}>• Cambios por modelo/talla: 5 días con etiqueta.</p>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>¡Gracias por su compra!</p>
        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '8px', color: '#555' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}
