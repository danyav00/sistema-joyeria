function etiquetaMaterial(material) {
  if (material === 'PLATA') return 'Plata';
  if (material === 'ORO') return 'Oro';
  if (material === 'ORO_LAMINADO') return 'Oro Laminado';
  return material || '';
}

export default function TicketApartado({ apartado, tipo, montoAbono, versiculo, atendio }) {
  const fecha = new Date();

  return (
    <div
      id="ticket-imprimir"
      style={{
  width: '7.6cm',
  minHeight: '18cm',
  padding: '0.3cm',
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '13px',
  color: '#000000',
  backgroundColor: '#ffffff',
  background: '#ffffff',
  lineHeight: '1.3',
}}
    >
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>NIXCA JOYERÍA</p>
        <p style={{ fontSize: '11px', margin: 0 }}>Celular/WhatsApp: 477 523 7223</p>
        <p style={{ fontSize: '11px', margin: 0 }}>IG: joyerias.nixca</p>
        <p style={{ fontSize: '11px', margin: '0 0 6px 0' }}>FB: joyerías nixca</p>

        <p style={{
          fontSize: '12px',
          fontWeight: 'bold',
          margin: '6px 0',
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          padding: '3px 0'
        }}>
          {tipo === 'CREADO' ? 'TICKET DE APARTADO' : 'TICKET DE ABONO'}
        </p>

        <p style={{ margin: 0 }}>Folio: {apartado.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Atendió: {atendio || '—'}</p>
        <p style={{ margin: 0 }}>Cliente: {apartado.clienteNombre}</p>
        <p style={{ margin: 0 }}>Tel: {apartado.clienteTelefono}</p>
      </div>

      <div style={{
        borderTop: '1px dashed #000',
        borderBottom: '1px dashed #000',
        padding: '8px 0',
        margin: '8px 0'
      }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
          Producto: {apartado.producto?.sku} — {apartado.producto?.nombre}
        </p>
        {apartado.producto?.material && (
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#333' }}>
            Material: {etiquetaMaterial(apartado.producto.material)}
          </p>
        )}
        <p style={{ margin: '0 0 3px 0', display: 'flex', justifyContent: 'space-between' }}>
          <span>Precio total:</span>
          <span>${Number(apartado.precioTotal).toFixed(2)}</span>
        </p>

        {tipo === 'CREADO' ? (
          <p style={{ margin: '0 0 3px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Anticipo:</span>
            <span>${Number(apartado.anticipo).toFixed(2)}</span>
          </p>
        ) : (
          <p style={{ margin: '0 0 3px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Este abono:</span>
            <span>${Number(montoAbono).toFixed(2)}</span>
          </p>
        )}

        <p style={{
          margin: '6px 0 0 0',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>SALDO PENDIENTE:</span>
          <span>${Number(apartado.saldoPendiente).toFixed(2)}</span>
        </p>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px' }}>
        <div style={{ fontSize: '10px', textAlign: 'left', marginBottom: '10px' }}>
          <p style={{ margin: '3px 0' }}>• Conserve este ticket para dar seguimiento a su apartado.</p>
        </div>

        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>¡Gracias por su preferencia!</p>

        {versiculo && (
          <p style={{ fontStyle: 'italic', fontSize: '11px', marginTop: '10px' }}>
            "{versiculo}"
          </p>
        )}
      </div>
    </div>
  );
}