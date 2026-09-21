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
        <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '2px 0', color: '#000' }}>
          {tipo === 'ABIERTO' ? 'TICKET DE CRÉDITO MAYORISTA' : 'TICKET DE LIQUIDACIÓN DE CRÉDITO'}
        </p>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#000' }}>Folio: {credito.folio}</p>
        <p style={{ margin: 0, color: '#000' }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#000' }}>Atendió: {atendio || '—'}</p>
        <p style={{ margin: 0, color: '#000' }}>Cliente: {credito.mayorista?.nombreCompleto}</p>
        <p style={{ margin: 0, color: '#000' }}>Tel: {credito.mayorista?.telefono}</p>
        <p style={{ margin: 0, color: '#000' }}>No. Cliente: {credito.mayorista?.numeroCliente}</p>
      </div>

      {tipo === 'ABIERTO' ? (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>Productos entregados:</p>
          {credito.productos.map((p) => (
            <div key={p.id} style={{ marginBottom: '3px' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                <span>${Number(p.precioAlMomento).toFixed(2)}</span>
              </p>
              {p.producto?.material && (
                <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#000' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
              )}
            </div>
          ))}
          <p style={{ margin: '6px 0 0 0', fontWeight: 'bold', fontSize: '13px', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
            <span>TOTAL CRÉDITO:</span><span>${Number(credito.totalCredito).toFixed(2)}</span>
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>
            Fecha límite: {new Date(credito.fechaLimite).toLocaleDateString('es-MX')}
          </p>
        </div>
      ) : (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>Productos vendidos / pagados:</p>
          {productosVendidos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '10px', color: '#000' }}>Ninguno</p>
          ) : (
            productosVendidos.map((p) => (
              <div key={p.id} style={{ marginBottom: '3px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#000' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 4px 0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>Productos devueltos al inventario:</p>
          {productosDevueltos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '10px', color: '#000' }}>Ninguno</p>
          ) : (
            productosDevueltos.map((p) => (
              <div key={p.id} style={{ marginBottom: '3px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#000' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 0 0', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>Reportado como vendido: ${Number(credito.totalVendido).toFixed(2)}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '13px', display: 'flex', justifyContent: 'space-between', color: '#000' }}>
            <span>TOTAL PAGADO:</span>
            <span>${productosVendidos.reduce((s, p) => s + Number(p.precioAlMomento), 0).toFixed(2)}</span>
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '8px', marginTop: '10px' }}>
        <div style={{ fontSize: '9px', textAlign: 'left', marginBottom: '8px', color: '#000', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>• La garantía es únicamente de 3 meses por deschapeado.</p>
        </div>

        <p style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>¡Gracias por su compra!</p>

        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '11px', marginTop: '8px', color: '#000' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}