-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'EMPLEADO', 'SOCIO');

-- CreateEnum
CREATE TYPE "TipoTurno" AS ENUM ('MATUTINO', 'VESPERTINO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('ABIERTO', 'CERRADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoTurno" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaApertura" TEXT NOT NULL,
    "fechaCierre" TIMESTAMP(3),
    "horaCierre" TEXT,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'ABIERTO',

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
