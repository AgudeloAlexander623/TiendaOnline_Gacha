# Escenarios de abuso

> **Estado:** Fase 0 — catálogo inicial. Cada escenario debe convertirse en una prueba
> automatizada antes de cerrar la fase correspondiente.
> **Área:** seguridad de la economía y análisis de fraude.

---

## 1. Autenticación y sesiones

- [ ] Fuerza bruta contra el login.
- [ ] Credential stuffing con muchas cuentas.
- [ ] Reutilización de un token expirado.
- [ ] Reutilización de un refresh token rotado.
- [ ] Acceso a un recurso con rol insuficiente.
- [ ] Uso de un token de servicio sin el scope requerido.
- [ ] Token de servicio firmado con otro secreto.

## 2. Monedero

- [ ] Doble clic en una operación de débito.
- [ ] Dos débitos simultáneos con saldo justo.
- [ ] Reintento con la misma clave de idempotencia.
- [ ] Misma clave con cuerpo distinto.
- [ ] Intento de enviar el saldo desde el cliente.
- [ ] Monto negativo, cero o desbordado.
- [ ] Gasto de un lote vencido.
- [ ] Vencimiento ejecutado dos veces.
- [ ] Modificación o borrado de un movimiento.
- [ ] Drift entre lotes y saldo.

## 3. Partidas de juego

- [ ] Puntaje inventado por el cliente.
- [ ] Replay de una sesión ya validada.
- [ ] Sesión de otro usuario.
- [ ] Partida con duración imposible.
- [ ] Jefe derrotado sin enemigos previos.
- [ ] Items que no existen en la tabla de drops.
- [ ] Muchas sesiones por minuto.
- [ ] Ganancias siempre en el tope.
- [ ] Reloj del cliente manipulado.
- [ ] Superación del tope diario.

## 4. Ruleta

- [ ] Tirada sin saldo suficiente.
- [ ] Doble clic en una tirada.
- [ ] Cliente que intenta fijar el premio.
- [ ] Cliente que intenta enviar la semilla.
- [ ] Pesos negativos o suma inválida.
- [ ] Frecuencia anómala de premios raros.
- [ ] Muchas tiradas desde la misma cuenta o IP.
- [ ] Tirada sin registro de auditoría.

## 5. Pagos y recargas

- [ ] Crédito duplicado por callback repetido.
- [ ] Monto distinto al paquete.
- [ ] Crédito sin pago aprobado.
- [ ] Pago fallido que acredita monedas.
- [ ] Reembolso que deja saldo negativo.
- [ ] Muchas recargas en poco tiempo.
- [ ] Crédito huérfano detectado por conciliación.

## 6. Descuentos y pedidos

- [ ] Descuento reutilizado.
- [ ] Descuento aplicado sin elegibilidad.
- [ ] Precio final manipulado desde el cliente.
- [ ] Descuento acumulado indebidamente.
- [ ] Pedido con stock negativo.
- [ ] Pedido cancelado que no devuelve el stock.
- [ ] Débito de monedas sin compensación al fallar el checkout.

## 7. Servicio de fraude

- [ ] Evento duplicado.
- [ ] Evento con datos sensibles.
- [ ] Evento con esquema inválido.
- [ ] `fraud-service` caído durante una operación.
- [ ] `fraud-service` lento y timeout.
- [ ] Caso abierto sin evidencia suficiente.
- [ ] Alerta enviada con datos personales.
- [ ] Cambio de regla sin auditoría.

---

## 8. Criterio de cierre

- [ ] Cada escenario tiene una prueba automatizada o una justificación de por qué no.
- [ ] Las pruebas de concurrencia usan peticiones reales.
- [ ] Las pruebas de contrato validan los esquemas.
- [ ] Los resultados se registran en la matriz de trazabilidad.
