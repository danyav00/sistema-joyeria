-- CreateEnum
CREATE TYPE "TipoDevolucion" AS ENUM ('DEVOLUCION', 'CAMBIO');

-- DropForeignKey
ALTER TABLE "devoluciones" DROP CONSTRAINT "devoluciones_productoNuevoId_fkey";

-- AlterTable
ALTER TABLE "devoluciones" ADD COLUMN     "danado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metodoPago" TEXT,
ADD COLUMN     "tipo" "TipoDevolucion" NOT NULL DEFAULT 'CAMBIO',
ALTER COLUMN "productoNuevoId" DROP NOT NULL,
ALTER COLUMN "diferenciaPagada" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_productoNuevoId_fkey" FOREIGN KEY ("productoNuevoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
