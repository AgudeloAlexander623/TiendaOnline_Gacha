/**
 * Manejo centralizado de errores del payments-service.
 *
 * Reglas de negocio:
 * - Todo error con significado de negocio (monto inválido, proveedor de pago no
 *   configurado, pago rechazado, etc.) se representa con `AppError`.
 * - El `code` es un CONTRATO PÚBLICO: está en inglés, en mayúsculas y una vez
 *   publicado no cambia, porque el frontend u otros servicios pueden depender de él.
 * - El `message` está en español porque es el texto que recibe el usuario final
 *   en la respuesta de la API.
 * - `isOperational = true` → error de negocio esperado; el cliente puede ver su mensaje.
 * - `isOperational = false` → fallo inesperado (bug, infraestructura); NUNCA se expone
 *   su mensaje ni su stack al cliente: se responde un error genérico 500.
 * - El encadenamiento se hace con el `cause` nativo de `Error` (ES2022+), de modo que
 *   se conserva el error original para los logs sin perder el contexto de negocio.
 * - `context` es solo para logs/telemetría: está prohibido guardar ahí secretos
 *   (claves de Stripe/MercadoPago, tokens, datos de tarjeta).
 */

/** Opciones de creación de un `AppError`. Todas las reglas aplican al constructor. */
export interface AppErrorOptions {
  /** Identificador estable del error. Contrato público: no se renombra una vez publicado. */
  readonly code: string;
  /** Estado HTTP que se devolverá al cliente. */
  readonly statusCode: number;
  /** Error original que provocó este. Solo se usa en logs, jamás se devuelve al cliente. */
  readonly cause?: unknown;
  /** `true` (por defecto) si es un error de negocio esperado; `false` si es un fallo inesperado. */
  readonly isOperational?: boolean;
  /** Datos adicionales para el log. Prohibido incluir secretos o datos de tarjeta. */
  readonly context?: Readonly<Record<string, unknown>>;
}

/** Representación segura de la respuesta: nunca incluye stack, causa ni contexto. */
export interface AppErrorResponse {
  readonly code: string;
  readonly message: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Readonly<Record<string, unknown>>;

  public constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
  }

  /** Serialización para respuestas HTTP: solo código y mensaje, nunca detalles internos. */
  public toJSON(): AppErrorResponse {
    return { code: this.code, message: this.message };
  }
}

/** Type guard: distingue errores de negocio de fallos inesperados en el handler global. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
