// Logger estructurado del servicio (Pino).

import pino from "pino";
import { config } from "../config/config.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  base: { service: config.SERVICE_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
});
