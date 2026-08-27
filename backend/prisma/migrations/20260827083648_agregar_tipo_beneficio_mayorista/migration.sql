-- CreateEnum
CREATE TYPE "TipoBeneficioMayorista" AS ENUM ('NORMAL', 'SIN_CARPETA', 'ESPECIAL');

-- AlterTable
ALTER TABLE "mayoristas" ADD COLUMN     "tipoBeneficio" "TipoBeneficioMayorista" NOT NULL DEFAULT 'NORMAL';
