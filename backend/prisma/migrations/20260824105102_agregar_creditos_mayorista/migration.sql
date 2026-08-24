-- CreateEnum
CREATE TYPE "EstadoCredito" AS ENUM ('ACTIVO', 'LIQUIDADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "creditos_mayorista" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "mayoristaId" INTEGER NOT NULL,
    "totalCredito" DECIMAL(10,2) NOT NULL,
    "totalVendido" DECIMAL(10,2),
    "fechaEntrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "fechaLiquidacion" TIMESTAMP(3),
    "estado" "EstadoCredito" NOT NULL DEFAULT 'ACTIVO',
    "usuarioId" INTEGER NOT NULL,
    "ventaId" INTEGER,

    CONSTRAINT "creditos_mayorista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credito_mayorista_productos" (
    "id" SERIAL NOT NULL,
    "creditoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioAlMomento" DECIMAL(10,2) NOT NULL,
    "devuelto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "credito_mayorista_productos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creditos_mayorista_folio_key" ON "creditos_mayorista"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "creditos_mayorista_ventaId_key" ON "creditos_mayorista"("ventaId");

-- AddForeignKey
ALTER TABLE "creditos_mayorista" ADD CONSTRAINT "creditos_mayorista_mayoristaId_fkey" FOREIGN KEY ("mayoristaId") REFERENCES "mayoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos_mayorista" ADD CONSTRAINT "creditos_mayorista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos_mayorista" ADD CONSTRAINT "creditos_mayorista_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito_mayorista_productos" ADD CONSTRAINT "credito_mayorista_productos_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "creditos_mayorista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credito_mayorista_productos" ADD CONSTRAINT "credito_mayorista_productos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
