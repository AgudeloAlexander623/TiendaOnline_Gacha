// Rutas del carrito (requieren autenticación).

import { Router } from "express";
import { asyncHandler } from "../../shared/errors.js";
import { authenticate, requireUser } from "../../shared/auth.js";
import {
  addCartItemSchema,
  cartItemParamSchema,
  updateCartItemSchema,
} from "./carts.schemas.js";
import {
  addItem,
  clearCart,
  getMyCart,
  removeItem,
  updateItem,
} from "./carts.service.js";

export const cartsRouter = Router();

cartsRouter.use(authenticate);

cartsRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await getMyCart(requireUser(req).id));
  }),
);

cartsRouter.delete(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await clearCart(requireUser(req).id));
  }),
);

cartsRouter.post(
  "/items",
  asyncHandler(async (req, res) => {
    const input = addCartItemSchema.parse(req.body);
    res.status(201).json(await addItem(requireUser(req).id, input));
  }),
);

cartsRouter.patch(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const { itemId } = cartItemParamSchema.parse(req.params);
    const input = updateCartItemSchema.parse(req.body);
    res.json(await updateItem(requireUser(req).id, itemId, input));
  }),
);

cartsRouter.delete(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const { itemId } = cartItemParamSchema.parse(req.params);
    res.json(await removeItem(requireUser(req).id, itemId));
  }),
);
