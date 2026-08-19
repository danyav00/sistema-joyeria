const prisma = require('./prisma');

async function registrarAuditoria({ usuarioId, accion, tablaAfectada, registroId, detalle }) {
  try {
    await prisma.auditoria.create({
      data: { usuarioId, accion, tablaAfectada, registroId, detalle },
    });
  } catch (error) {
    console.error('Error al registrar auditoria:', error);
  }
}

module.exports = { registrarAuditoria };