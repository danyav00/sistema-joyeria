-- CreateEnum
CREATE TYPE "EstadoMayorista" AS ENUM ('ACTIVO', 'SUSPENDIDO');

-- CreateTable
CREATE TABLE "mayoristas" (
    "id" SERIAL NOT NULL,
    "numeroCliente" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "estado" "EstadoMayorista" NOT NULL DEFAULT 'ACTIVO',
    "totalAcumuladoPeriodo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fechaUltimaCompra" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mayoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mayorista_compras" (
    "id" SERIAL NOT NULL,
    "mayoristaId" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carpetaEntregada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mayorista_compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cortes" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "totalVentas" DECIMAL(10,2) NOT NULL,
    "totalGastos" DECIMAL(10,2) NOT NULL,
    "totalDevoluciones" DECIMAL(10,2) NOT NULL,
    "totalEfectivo" DECIMAL(10,2) NOT NULL,
    "totalTarjeta" DECIMAL(10,2) NOT NULL,
    "totalTransferencia" DECIMAL(10,2) NOT NULL,
    "totalDeposito" DECIMAL(10,2) NOT NULL,
    "totalFinal" DECIMAL(10,2) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mayoristas_numeroCliente_key" ON "mayoristas"("numeroCliente");

-- CreateIndex
CREATE UNIQUE INDEX "mayorista_compras_ventaId_key" ON "mayorista_compras"("ventaId");

-- CreateIndex
CREATE UNIQUE INDEX "cortes_turnoId_key" ON "cortes"("turnoId");

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_mayoristaId_fkey" FOREIGN KEY ("mayoristaId") REFERENCES "mayoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mayorista_compras" ADD CONSTRAINT "mayorista_compras_mayoristaId_fkey" FOREIGN KEY ("mayoristaId") REFERENCES "mayoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mayorista_compras" ADD CONSTRAINT "mayorista_compras_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes" ADD CONSTRAINT "cortes_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes" ADD CONSTRAINT "cortes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
