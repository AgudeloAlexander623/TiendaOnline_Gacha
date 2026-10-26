// Middleware de autenticación servicio-a-servicio.

import { authenticateService } from "../auth.js";

export function requireService(scopes: string[] = []) {
  return authenticateService(scopes);
}
