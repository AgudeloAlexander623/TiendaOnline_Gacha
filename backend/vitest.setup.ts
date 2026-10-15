// Variables de entorno para la ejecución de pruebas (Vitest).
// Se cargan antes que los archivos de test, de modo que `config` valide bien.
// `dotenv` no sobreescribe variables ya definidas, así que estos valores mandan.

process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.CORS_ORIGIN ??= "*";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/gearquest_test?schema=public";
process.env.JWT_SECRET ??= "test-secret-key-please-change-1234567890";
