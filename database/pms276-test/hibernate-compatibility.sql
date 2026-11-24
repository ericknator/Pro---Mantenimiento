-- Compatibilidad exclusiva del entorno aislado PMS-276.
--
-- El DDL V4 histórico no contiene todavía las tablas de alertas internas,
-- pero las entidades JPA actuales sí las mapean. Este complemento no modifica
-- el script original ni se ejecuta sobre bdpromantenimiento20262.

CREATE TABLE IF NOT EXISTS tipo_alerta_interna (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS estado_alerta_interna (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alerta_interna (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    residente_id BIGINT UNSIGNED NOT NULL,
    tipo_alerta_id BIGINT UNSIGNED NOT NULL,
    estado_id BIGINT UNSIGNED NOT NULL,
    recibido_por_id BIGINT UNSIGNED NULL,
    fecha_recepcion TIMESTAMP NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    fecha_emision TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMP NOT NULL,
    CONSTRAINT fk_alerta_interna_residente
        FOREIGN KEY (residente_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_alerta_interna_tipo
        FOREIGN KEY (tipo_alerta_id) REFERENCES tipo_alerta_interna(id),
    CONSTRAINT fk_alerta_interna_estado
        FOREIGN KEY (estado_id) REFERENCES estado_alerta_interna(id),
    CONSTRAINT fk_alerta_interna_recibido_por
        FOREIGN KEY (recibido_por_id) REFERENCES usuario_perfil(id),
    INDEX idx_alerta_interna_residente (residente_id),
    INDEX idx_alerta_interna_estado (estado_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS actuacion_alerta_interna (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alerta_interna_id BIGINT UNSIGNED NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    estado_anterior_id BIGINT UNSIGNED NOT NULL,
    estado_nuevo_id BIGINT UNSIGNED NOT NULL,
    observacion TEXT NULL,
    creado_en TIMESTAMP NOT NULL,
    CONSTRAINT fk_actuacion_alerta_alerta
        FOREIGN KEY (alerta_interna_id) REFERENCES alerta_interna(id),
    CONSTRAINT fk_actuacion_alerta_actor
        FOREIGN KEY (actor_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_actuacion_alerta_estado_anterior
        FOREIGN KEY (estado_anterior_id) REFERENCES estado_alerta_interna(id),
    CONSTRAINT fk_actuacion_alerta_estado_nuevo
        FOREIGN KEY (estado_nuevo_id) REFERENCES estado_alerta_interna(id),
    INDEX idx_actuacion_alerta_fecha (alerta_interna_id, creado_en)
) ENGINE=InnoDB;

-- El modelo Java utiliza Integer para estos valores. MySQL conserva los datos
-- y se normaliza el tipo solo en esta copia para que ddl-auto=validate pueda
-- detectar cambios reales sin confundirlos con rangos TINYINT/SMALLINT.
ALTER TABLE estado_incidencia
    MODIFY COLUMN orden INT NOT NULL;

ALTER TABLE prioridad_incidencia
    MODIFY COLUMN orden INT NOT NULL;

ALTER TABLE frecuencia_mantenimiento
    MODIFY COLUMN cantidad INT NOT NULL;

ALTER TABLE plan_mantenimiento
    MODIFY COLUMN dias_alerta INT NOT NULL;

ALTER TABLE torre
    MODIFY COLUMN pisos INT NULL;

ALTER TABLE unidad_residencial
    MODIFY COLUMN piso INT NOT NULL;
