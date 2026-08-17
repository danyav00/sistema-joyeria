-- CreateEnum
CREATE TYPE "TipoVenta" AS ENUM ('MENUDEO', 'MAYOREO');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('COMPLETADA', 'CANCELADA', 'CON_DEVOLUCION');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'DEPOSITO');

-- CreateEnum
CREATE TYPE "EstadoApartado" AS ENUM ('ACTIVO', 'LIQUIDADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "tipoVenta" "TipoVenta" NOT NULL,
    "mayoristaId" INTEGER,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'COMPLETADA',

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_detalle" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "venta_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_pagos" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "venta_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartados" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteTelefono" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "anticipo" DECIMAL(10,2) NOT NULL,
    "saldoPendiente" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoApartado" NOT NULL DEFAULT 'ACTIVO',
    "fechaApartado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartado_abonos" (
    "id" SERIAL NOT NULL,
    "apartadoId" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartado_abonos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ventas_folio_key" ON "ventas"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "apartados_folio_key" ON "apartados"("folio");

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalle" ADD CONSTRAINT "venta_detalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_pagos" ADD CONSTRAINT "venta_pagos_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartados" ADD CONSTRAINT "apartados_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartados" ADD CONSTRAINT "apartados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartado_abonos" ADD CONSTRAINT "apartado_abonos_apartadoId_fkey" FOREIGN KEY ("apartadoId") REFERENCES "apartados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartado_abonos" ADD CONSTRAINT "apartado_abonos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
