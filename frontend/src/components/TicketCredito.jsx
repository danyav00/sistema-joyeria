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
          {tipo === 'ABIERTO' ? 'TICKET DE CRÉDITO MAYORISTA' : 'TICKET DE LIQUIDACIÓN DE CRÉDITO'}
        </p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Folio: {credito.folio}</p>
        <p style={{ margin: 0 }}>{fecha.toLocaleDateString('es-MX')} {fecha.toLocaleTimeString('es-MX')}</p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Atendió: {atendio || '—'}</p>
        <p style={{ margin: 0 }}>Cliente: {credito.mayorista?.nombreCompleto}</p>
        <p style={{ margin: 0 }}>Tel: {credito.mayorista?.telefono}</p>
        <p style={{ margin: 0 }}>No. Cliente: {credito.mayorista?.numeroCliente}</p>
      </div>

      {tipo === 'ABIERTO' ? (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '8px 0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold' }}>Productos entregados:</p>
          {credito.productos.map((p) => (
            <div key={p.id} style={{ marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                <span>${Number(p.precioAlMomento).toFixed(2)}</span>
              </p>
              {p.producto?.material && (
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
              )}
            </div>
          ))}
          <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase' }}>
            <span>TOTAL CRÉDITO:</span><span>${Number(credito.totalCredito).toFixed(2)}</span>
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>
            Fecha límite: {new Date(credito.fechaLimite).toLocaleDateString('es-MX')}
          </p>
        </div>
      ) : (
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '8px 0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold' }}>Productos vendidos / pagados:</p>
          {productosVendidos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '11px' }}>Ninguno</p>
          ) : (
            productosVendidos.map((p) => (
              <div key={p.id} style={{ marginBottom: '4px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 6px 0', fontSize: '11px', fontWeight: 'bold' }}>Productos devueltos al inventario:</p>
          {productosDevueltos.length === 0 ? (
            <p style={{ margin: 0, fontSize: '11px' }}>Ninguno</p>
          ) : (
            productosDevueltos.map((p) => (
              <div key={p.id} style={{ marginBottom: '4px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{p.producto?.sku} — {p.producto?.nombre}</span>
                  <span>${Number(p.precioAlMomento).toFixed(2)}</span>
                </p>
                {p.producto?.material && (
                  <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>Material: {etiquetaMaterial(p.producto.material)}</p>
                )}
              </div>
            ))
          )}

          <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>Reportado como vendido: ${Number(credito.totalVendido).toFixed(2)}</p>
          <p style={{ margin: '6px 0 0 0', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase' }}>
            <span>TOTAL PAGADO:</span>
            <span>${productosVendidos.reduce((s, p) => s + Number(p.precioAlMomento), 0).toFixed(2)}</span>
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '10px', marginTop: '12px' }}>
        <div style={{ fontSize: '10px', textAlign: 'left', marginBottom: '10px', color: '#555', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>• Garantía: 3 meses por deschapeado.</p>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 'bold' }}>¡Gracias por su compra!</p>
        {versiculo && <p style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '8px', color: '#555' }}>"{versiculo}"</p>}
      </div>
    </div>
  );
}
