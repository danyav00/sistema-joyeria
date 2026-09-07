function etiquetaMaterial(material) {
  if (material === 'PLATA') return 'Plata';
  if (material === 'ORO') return 'Oro';
  if (material === 'ORO_LAMINADO') return 'Oro Laminado';
  return material || '';
}

export default function TicketCredito({ credito, tipo, versiculo, atendio }) {
  const fecha = new Date(tipo === 'ABIERTO' ? credito.fechaEntrega : credito.fechaLiquidacion);
  const productosDevueltos = credito.productos.filter((p) => p.devuelto);
  const productosVendidos = credito.productos.filter((p) => !p.devuelto);

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
          {tipo === 'ABIERTO' ? 'TICKET DE CRÉDITO MAYORISTA' : 'TICKET DE LIQUIDACIÓN DE CRÉDITO'}
        </p>
        <p style={{ margin: 0 }}>Folio: {credito.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0 }}>Atendió: {atendio || '—'}</p>
        <p style={{ margin: 0 }}>Cliente: {credito.mayorista?.nombreCompleto}</p>
        <p style={{ margin: 0 }}>Tel: {credito.mayorista?.telefono}</p>
        <p style={{ margin: 0 }}>No. Cliente: {credito.mayorista?.numeroCliente}</p>
      </div>

      {tipo === 'ABIERTO' ? (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Productos entregados:</p>
          {credito.productos.map((p) => (
            <div key={p.id} style={{ marginBottom: '3px' }}>
              <p style={{ margin: 0, fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                <span>${Number(p.precioAlMomento).toFixed(2)}</span>
              </p>
              {p.producto?.material && (
                <p style={{ margin: 0, fontSize: '8px', color: '#444' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
              )}
            </div>
          ))}
          <p style={{ margin: '6px 0 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>TOTAL CRÉDITO:</span><span>${Number(credito.totalCredito).toFixed(2)}</span>
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '9px' }}>
            Fecha límite: {new Date(credito.fechaLimite).toLocaleDateString('es-MX')}
          </p>
        </div>
      ) : (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Productos vendidos / pagados:</p>
          {productosVendidos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '9px' }}>Ninguno</p>
          ) : (
            productosVendidos.map((p) => (
              <div key={p.id} style={{ marginBottom: '3px' }}>
                <p style={{ margin: 0, fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '8px', color: '#444' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 4px 0', fontSize: '9px', fontWeight: 'bold' }}>Productos devueltos (cambio):</p>
          {productosDevueltos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '9px' }}>Ninguno</p>
          ) : (
            productosDevueltos.map((p) => (
              <div key={p.id} style={{ marginBottom: '3px' }}>
                <p style={{ margin: 0, fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '8px', color: '#444' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 0 0', fontSize: '9px' }}>Reportado como vendido: ${Number(credito.totalVendido).toFixed(2)}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>TOTAL PAGADO:</span>
            <span>${productosVendidos.reduce((s, p) => s + Number(p.precioAlMomento), 0).toFixed(2)}</span>
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px', marginTop: '10px' }}>
        <div style={{ fontSize: '8px', textAlign: 'left', marginBottom: '8px' }}>
          <p style={{ margin: '2px 0' }}>• La garantía es únicamente de 3 meses por deschapeado.</p>
        </div>

        <p style={{ fontSize: '9px' }}>¡Gracias por su compra!</p>

        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '10px', marginTop: '8px' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}