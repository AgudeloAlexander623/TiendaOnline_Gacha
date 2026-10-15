// Validación del módulo de gacha.

import { z } from "zod";

export const gachaBannerParamSchema = z.object({ bannerId: z.uuid() });
