// @gearquest/common · contratos y utilidades compartidas.
//
// Nota de arquitectura: por decisión del proyecto, cada servicio duplica su
// capa `src/shared/` (errores, logger, auth) para evitar acoplamiento de build
// dentro del monorepo. Este paquete queda como punto de extensión para
// contratos verdaderamente estables entre servicios.

export const PACKAGE_NAME = "@gearquest/common" as const;
export const PACKAGE_VERSION = "0.1.0" as const;
