export default function TicketApartado({ apartado, tipo, montoAbono }) {
  const fecha = new Date();

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
          {tipo === 'CREADO' ? 'TICKET DE APARTADO' : 'TICKET DE ABONO'}
        </p>
        <p style={{ margin: 0 }}>Folio: {apartado.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Cliente: {apartado.clienteNombre}</p>
        <p style={{ margin: 0 }}>Tel: {apartado.clienteTelefono}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
        <p style={{ margin: '0 0 3px 0', fontSize: '9px' }}>Producto: {apartado.producto?.sku} — {apartado.producto?.nombre}</p>
        <p style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Precio total:</span><span>${Number(apartado.precioTotal).toFixed(2)}</span>
        </p>
        {tipo === 'CREADO' ? (
          <p style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Anticipo:</span><span>${Number(apartado.anticipo).toFixed(2)}</span>
          </p>
        ) : (
          <p style={{ margin: '0 0 3px 0', fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Este abono:</span><span>${Number(montoAbono).toFixed(2)}</span>
          </p>
        )}
        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>SALDO PENDIENTE:</span><span>${Number(apartado.saldoPendiente).toFixed(2)}</span>
        </p>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px' }}>
        <p style={{ fontSize: '9px' }}>¡Gracias por su preferencia!</p>
        <div style={{ marginTop: '8px', fontSize: '8px', textAlign: 'left', borderTop: '1px dashed #000', paddingTop: '6px' }}>
          <p style={{ margin: '2px 0' }}>• Conserve este ticket para dar seguimiento a su apartado.</p>
        </div>
      </div>
    </div>
  );
}