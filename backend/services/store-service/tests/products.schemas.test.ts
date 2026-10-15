import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  listProductsQuerySchema,
} from "../src/modules/catalog/products.schemas.js";

describe("store-service · products schemas", () => {
  it("acepta un producto válido y aplica valores por defecto", () => {
    const result = createProductSchema.safeParse({
      sku: "KB-100",
      name: "Teclado de prueba",
      slug: "teclado-de-prueba",
      price: 100000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("COP");
      expect(result.data.stock).toBe(0);
      expect(result.data.images).toEqual([]);
    }
  });

  it("rechaza un precio no positivo", () => {
    const result = createProductSchema.safeParse({
      sku: "KB-101",
      name: "Malo",
      slug: "malo",
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it("convierte includeInactive y pagina por defecto", () => {
    const query = listProductsQuerySchema.parse({});
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(20);
    expect(query.includeInactive).toBe(false);
  });
});
