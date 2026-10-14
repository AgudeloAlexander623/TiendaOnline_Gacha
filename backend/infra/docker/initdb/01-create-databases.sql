-- ============================================================
-- GearQuest · creación inicial de bases de datos
-- ============================================================
-- Se ejecuta automáticamente la primera vez que se levanta el
-- contenedor de PostgreSQL (docker-entrypoint-initdb.d).
--
-- Estrategia: una base de datos por servicio para aislar los datos.

CREATE DATABASE gearquest_identity;
CREATE DATABASE gearquest_store;
CREATE DATABASE gearquest_economy;
CREATE DATABASE gearquest_payments;
