# 04 · Integridad de la ruleta (gacha)

> **Estado:** esqueleto de Fase 0 — pendiente de completar y aprobar.
> **Área:** seguridad de la economía.
> **Referencias:** `FR-BE-16`, `FR-BR-04`, `FR-GA-11`, `FR-GA-12`, diagrama 02.

---

## 1. Propósito

Garantizar que la ruleta no pueda manipularse desde el cliente y que cada tirada sea
auditable: costo, semilla, resultado y recompensa.

## 2. Controles previstos

- [ ] El costo lo decide el servidor.
- [ ] El saldo se valida y se debita antes de revelar el premio.
- [ ] La selección usa un generador criptográficamente seguro.
- [ ] Los pesos se validan al crear o editar la ruleta.
- [ ] La suma de pesos y las probabilidades son coherentes.
- [ ] El cliente no puede enviar semilla, premio ni probabilidad.
- [ ] Una tirada se registra una sola vez.
- [ ] Doble clic o reintento no cobra dos veces.
- [ ] Se aplican límites por usuario, IP y ventana de tiempo.
- [ ] Las probabilidades se publican en la interfaz.
- [ ] La tirada queda en el historial y en auditoría.

## 3. Registro de una tirada

| Campo | Uso |
| --- | --- |
| `bannerId` | Ruleta utilizada |
| `walletId` | Dueño de la tirada |
| `costCoins` | Costo cobrado |
| `serverSeedHash` | Compromiso previo a la tirada |
| `serverSeed` | Semilla revelada después, si se usa esquema provably fair |
| `roll` | Valor aleatorio usado |
| `rewardId` | Premio entregado |
| `riskScore` | Puntaje de riesgo, si aplica |

## 4. Señales de abuso

- [ ] Muchas tiradas por minuto.
- [ ] Ganancia anómala de premios raros.
- [ ] Saldo que no baja después de varias tiradas.
- [ ] Misma IP o dispositivo con muchas cuentas.
- [ ] Intentos de enviar un premio o una semilla desde el cliente.
- [ ] Pesos inválidos o suma distinta de la esperada.

## 5. Pruebas mínimas

- [ ] Tirada con saldo suficiente descuenta una vez.
- [ ] Tirada sin saldo se rechaza.
- [ ] Doble clic no duplica el cobro.
- [ ] Pesos negativos o suma inválida se rechazan.
- [ ] El cliente no puede fijar el premio.
- [ ] La distribución es razonable en una simulación grande.
- [ ] Cada tirada queda auditada.

## 6. Decisiones pendientes

1. Coste y probabilidades de cada banner.
2. Uso de esquema provably fair.
3. Topes de tiradas por usuario y por día.
4. Si existe sistema de pity o garantía.
5. Retención del historial de tiradas.
