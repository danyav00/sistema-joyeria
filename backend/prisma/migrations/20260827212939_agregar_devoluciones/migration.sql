-- CreateTable
CREATE TABLE "devoluciones" (
    "id" SERIAL NOT NULL,
    "folio" TEXT NOT NULL,
    "ventaOriginalId" INTEGER NOT NULL,
    "productoDevueltoId" INTEGER NOT NULL,
    "productoNuevoId" INTEGER NOT NULL,
    "diferenciaPagada" DECIMAL(10,2) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_folio_key" ON "devoluciones"("folio");

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_ventaOriginalId_fkey" FOREIGN KEY ("ventaOriginalId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_productoDevueltoId_fkey" FOREIGN KEY ("productoDevueltoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_productoNuevoId_fkey" FOREIGN KEY ("productoNuevoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
