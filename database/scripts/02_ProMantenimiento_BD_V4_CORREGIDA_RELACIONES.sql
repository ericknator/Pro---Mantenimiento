-- ============================================================
-- PRO-MANTENIMIENTO | MODELO RELACIONAL AMPLIADO
-- Caso piloto: Condominio Nuevo Alcázar - Rímac, Lima
-- Periodo académico: 2026-02
-- Motor objetivo: MySQL 8.x
--
-- Versión V4 FINAL: 47 tablas. V3 + correcciones de claves + organización física + catálogos de acción/evidencia.
--
-- PRINCIPIOS DEL MODELO
-- 1) Firebase Authentication gestiona credenciales/autenticación.
--    MySQL almacena el perfil, rol y datos operativos.
-- 2) El núcleo del MVP sigue siendo:
--      - Incidencias
--      - Mantenimiento preventivo
--      - Notificaciones/comunicados
--      - Consulta administrativa básica de cuotas
-- 3) Se agregan tablas técnicas, de catálogo, relación e historial
--    para mejorar normalización, trazabilidad y auditabilidad.
-- 4) Parqueo y paquetería NO se incorporan todavía porque en el
--    informe vigente permanecen pendientes de validación de campo.
-- 5) No se insertan usuarios, incidencias, métricas ni actividades
--    ficticias. Solo catálogos técnicos necesarios para operar.
--
-- NOTA:
-- Este script elimina y recrea la BD. Úsalo en DESARROLLO.
-- En etapas posteriores se recomienda migración versionada
-- (Flyway/Liquibase) en lugar de DROP DATABASE.
-- ============================================================

DROP DATABASE IF EXISTS bdpromantenimiento20262;

CREATE DATABASE bdpromantenimiento20262
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE bdpromantenimiento20262;

-- ============================================================
-- A. SEGURIDAD, IDENTIDAD Y AUTORIZACIÓN
-- ============================================================

-- 01
CREATE TABLE rol (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del rol',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable usado por la aplicación',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible del rol',
    descripcion VARCHAR(255) NULL COMMENT 'Responsabilidad general del rol',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el rol puede utilizarse'
) ENGINE=InnoDB
COMMENT='Catálogo de roles funcionales de Pro-Mantenimiento, como administrador, residente y mantenimiento.';

-- 02
CREATE TABLE permiso (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del permiso',
    codigo VARCHAR(60) NOT NULL UNIQUE COMMENT 'Código técnico del permiso',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del permiso',
    modulo VARCHAR(50) NOT NULL COMMENT 'Módulo funcional al que pertenece',
    descripcion VARCHAR(255) NULL COMMENT 'Acción de negocio que autoriza',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el permiso está vigente'
) ENGINE=InnoDB
COMMENT='Catálogo granular de permisos que Spring Boot puede aplicar después de validar la identidad de Firebase.';

-- 03
CREATE TABLE rol_permiso (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la relación rol-permiso',
    rol_id BIGINT UNSIGNED NOT NULL COMMENT 'Rol al que se concede el permiso',
    permiso_id BIGINT UNSIGNED NOT NULL COMMENT 'Permiso concedido',
    CONSTRAINT uq_rol_permiso UNIQUE (rol_id, permiso_id),
    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY (rol_id) REFERENCES rol(id),
    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY (permiso_id) REFERENCES permiso(id)
) ENGINE=InnoDB
COMMENT='Tabla puente que relaciona roles con permisos y evita codificar autorizaciones rígidas en cada usuario.';

-- 04	
CREATE TABLE usuario_perfil (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del perfil',
    firebase_uid VARCHAR(128) NOT NULL UNIQUE COMMENT 'UID emitido por Firebase Authentication',
    rol_id BIGINT UNSIGNED NOT NULL COMMENT 'Rol funcional vigente del usuario',
    nombres VARCHAR(100) NOT NULL COMMENT 'Nombres del usuario',
    apellidos VARCHAR(120) NOT NULL COMMENT 'Apellidos del usuario',
    correo VARCHAR(150) NOT NULL UNIQUE COMMENT 'Correo asociado a la identidad autenticada',
    telefono VARCHAR(20) NULL COMMENT 'Teléfono de contacto, cuando corresponda',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del perfil',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del perfil',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación del perfil',
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id) REFERENCES rol(id),
    INDEX idx_usuario_rol (rol_id)
) ENGINE=InnoDB
COMMENT='Perfil operativo del usuario autenticado con Firebase; MySQL no almacena su contraseña.';

-- 05
CREATE TABLE condominio (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del condominio',
    nombre VARCHAR(150) NOT NULL COMMENT 'Nombre oficial o de uso del condominio',
    distrito VARCHAR(80) NOT NULL COMMENT 'Distrito donde se ubica el condominio',
    provincia VARCHAR(80) NOT NULL DEFAULT 'Lima' COMMENT 'Provincia del caso piloto',
    departamento VARCHAR(80) NOT NULL DEFAULT 'Lima' COMMENT 'Departamento o región del caso piloto',
    direccion VARCHAR(200) NULL COMMENT 'Dirección exacta solo cuando haya sido confirmada y autorizada',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del condominio',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro'
) ENGINE=InnoDB
COMMENT='Registra la organización residencial atendida por la plataforma; en el piloto corresponde al Condominio Nuevo Alcázar del Rímac.';

-- 06
CREATE TABLE torre (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la torre',
    condominio_id BIGINT UNSIGNED NOT NULL COMMENT 'Condominio al que pertenece la torre',
    codigo VARCHAR(30) NOT NULL COMMENT 'Código estable de la torre dentro del condominio',
    nombre VARCHAR(80) NOT NULL COMMENT 'Nombre visible de la torre',
    pisos TINYINT UNSIGNED NULL COMMENT 'Cantidad de pisos confirmada para la torre',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la torre',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT uq_torre_condominio_codigo UNIQUE (condominio_id, codigo),
    CONSTRAINT fk_torre_condominio
        FOREIGN KEY (condominio_id) REFERENCES condominio(id),
    INDEX idx_torre_condominio (condominio_id)
) ENGINE=InnoDB
COMMENT='Representa cada torre física de un condominio y permite asociar las unidades residenciales con su ubicación estructural.';

-- 07
CREATE TABLE unidad_residencial (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la unidad',
    torre_id BIGINT UNSIGNED NOT NULL COMMENT 'Torre a la que pertenece la unidad residencial',
    piso TINYINT UNSIGNED NOT NULL COMMENT 'Piso de la unidad',
    numero VARCHAR(20) NOT NULL COMMENT 'Número o código de departamento',
    referencia VARCHAR(120) NULL COMMENT 'Referencia complementaria de ubicación',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la unidad',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT uq_unidad UNIQUE (torre_id, piso, numero),
    CONSTRAINT fk_unidad_torre
        FOREIGN KEY (torre_id) REFERENCES torre(id),
    INDEX idx_unidad_torre (torre_id)
) ENGINE=InnoDB
COMMENT='Registra las unidades residenciales del condominio para asociar residentes, incidencias, cuotas y visitas.';

-- 08
CREATE TABLE usuario_unidad (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la relación usuario-unidad',
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario relacionado con la unidad',
    unidad_id BIGINT UNSIGNED NOT NULL COMMENT 'Unidad residencial relacionada',
    relacion VARCHAR(30) NOT NULL DEFAULT 'RESIDENTE' COMMENT 'Tipo de relación: residente, propietario u otra autorizada',
    es_principal TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Marca la unidad principal del usuario',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la relación',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la relación',
    CONSTRAINT uq_usuario_unidad UNIQUE (usuario_id, unidad_id),
    CONSTRAINT fk_usuario_unidad_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_usuario_unidad_unidad
        FOREIGN KEY (unidad_id) REFERENCES unidad_residencial(id)
) ENGINE=InnoDB
COMMENT='Tabla puente que permite relacionar varios usuarios con una unidad y un usuario con más de una unidad autorizada.';

-- ============================================================
-- B. CATÁLOGOS Y PROVEEDORES PARA INCIDENCIAS / MANTENIMIENTO
-- ============================================================

-- 09
CREATE TABLE categoria_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la categoría',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable de categoría',
    nombre VARCHAR(80) NOT NULL UNIQUE COMMENT 'Nombre visible',
    descripcion VARCHAR(255) NULL COMMENT 'Alcance de la categoría',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico'
) ENGINE=InnoDB
COMMENT='Clasifica las incidencias reportadas para facilitar asignación, filtrado y análisis operativo.';

-- 10
CREATE TABLE prioridad_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de prioridad',
    codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'Código de prioridad',
    nombre VARCHAR(40) NOT NULL UNIQUE COMMENT 'Nombre visible',
    orden TINYINT UNSIGNED NOT NULL COMMENT 'Orden de menor a mayor prioridad',
    descripcion VARCHAR(255) NULL COMMENT 'Criterio general de uso',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico'
) ENGINE=InnoDB
COMMENT='Catálogo de niveles de prioridad utilizados por administración para clasificar la urgencia de una incidencia.';

-- 11
CREATE TABLE estado_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable del estado',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    orden TINYINT UNSIGNED NOT NULL COMMENT 'Orden lógico dentro del flujo',
    es_estado_final TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el estado cierra el caso',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del catálogo'
) ENGINE=InnoDB
COMMENT='Catálogo del ciclo de vida de una incidencia: reporte, clasificación, asignación, atención, solución, cierre o reapertura.';

-- 12
CREATE TABLE tipo_accion_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo de acción',
    codigo VARCHAR(40) NOT NULL UNIQUE COMMENT 'Código técnico estable utilizado por la aplicación',
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre visible del tipo de acción',
    descripcion VARCHAR(255) NULL COMMENT 'Finalidad de la acción dentro del ciclo de atención',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el tipo de acción está habilitado'
) ENGINE=InnoDB
COMMENT='Catálogo de acciones formales que pueden registrarse sobre una incidencia, como clasificación, asignación, diagnóstico, solución o reapertura.';

-- 13
CREATE TABLE tipo_evidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo de evidencia',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código técnico estable del tipo de evidencia',
    nombre VARCHAR(80) NOT NULL UNIQUE COMMENT 'Nombre visible del tipo de evidencia',
    descripcion VARCHAR(255) NULL COMMENT 'Descripción del formato o propósito de la evidencia',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el tipo de evidencia está habilitado'
) ENGINE=InnoDB
COMMENT='Catálogo común de tipos de evidencia utilizados en incidencias y mantenimientos, por ejemplo foto, video o documento.';

-- 14
CREATE TABLE proveedor (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del proveedor',
    razon_social VARCHAR(150) NOT NULL COMMENT 'Nombre o razón social del proveedor',
    ruc VARCHAR(11) NULL UNIQUE COMMENT 'RUC del proveedor cuando esté disponible y autorizado',
    especialidad VARCHAR(120) NULL COMMENT 'Especialidad principal del proveedor',
    correo VARCHAR(150) NULL COMMENT 'Correo operativo',
    telefono VARCHAR(30) NULL COMMENT 'Teléfono operativo',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del proveedor',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro'
) ENGINE=InnoDB
COMMENT='Registra empresas o técnicos externos que pueden atender incidencias o ejecutar mantenimientos especializados.';

-- 15
CREATE TABLE proveedor_contacto (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del contacto',
    proveedor_id BIGINT UNSIGNED NOT NULL COMMENT 'Proveedor al que pertenece',
    nombres VARCHAR(120) NOT NULL COMMENT 'Nombre del contacto',
    cargo VARCHAR(80) NULL COMMENT 'Cargo o función del contacto',
    correo VARCHAR(150) NULL COMMENT 'Correo del contacto',
    telefono VARCHAR(30) NULL COMMENT 'Teléfono del contacto',
    principal TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si es el contacto principal',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico',
    CONSTRAINT fk_proveedor_contacto_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    INDEX idx_proveedor_contacto (proveedor_id)
) ENGINE=InnoDB
COMMENT='Permite registrar contactos operativos de los proveedores para coordinar atención y mantenimiento.';

-- ============================================================
-- C. GESTIÓN DE INCIDENCIAS
-- ============================================================

-- 16
CREATE TABLE incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la incidencia',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código visible y único del ticket',
    solicitante_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que reportó la incidencia',
    unidad_id BIGINT UNSIGNED NULL COMMENT 'Unidad asociada cuando corresponda',
    categoria_id BIGINT UNSIGNED NOT NULL COMMENT 'Categoría vigente',
    prioridad_id BIGINT UNSIGNED NOT NULL COMMENT 'Prioridad vigente',
    estado_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado vigente',
    responsable_actual_id BIGINT UNSIGNED NULL COMMENT 'Responsable interno actual',
    ubicacion VARCHAR(255) NOT NULL COMMENT 'Lugar donde ocurre el problema',
    descripcion TEXT NOT NULL COMMENT 'Descripción original del reporte',
    fecha_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del reporte',
    fecha_solucion TIMESTAMP NULL COMMENT 'Fecha en que se declaró solucionada',
    fecha_cierre TIMESTAMP NULL COMMENT 'Fecha de confirmación y cierre',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación técnica',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación',
    CONSTRAINT fk_incidencia_solicitante
        FOREIGN KEY (solicitante_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_incidencia_unidad
        FOREIGN KEY (unidad_id) REFERENCES unidad_residencial(id),
    CONSTRAINT fk_incidencia_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria_incidencia(id),
    CONSTRAINT fk_incidencia_prioridad
        FOREIGN KEY (prioridad_id) REFERENCES prioridad_incidencia(id),
    CONSTRAINT fk_incidencia_estado
        FOREIGN KEY (estado_id) REFERENCES estado_incidencia(id),
    CONSTRAINT fk_incidencia_responsable
        FOREIGN KEY (responsable_actual_id) REFERENCES usuario_perfil(id),
    INDEX idx_incidencia_estado (estado_id),
    INDEX idx_incidencia_responsable (responsable_actual_id),
    INDEX idx_incidencia_fecha (fecha_reporte),
    INDEX idx_incidencia_solicitante (solicitante_id)
) ENGINE=InnoDB
COMMENT='Registro central del ticket de incidencia, con solicitante, clasificación, prioridad, estado y responsable vigente.';

-- 17
CREATE TABLE asignacion_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la asignación',
    incidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Incidencia asignada',
    asignado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que realizó la asignación',
    responsable_usuario_id BIGINT UNSIGNED NULL COMMENT 'Responsable interno asignado',
    proveedor_id BIGINT UNSIGNED NULL COMMENT 'Proveedor externo asignado, si corresponde',
    observacion VARCHAR(500) NULL COMMENT 'Motivo o instrucciones de la asignación',
    asignado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de asignación',
    finalizado_en TIMESTAMP NULL COMMENT 'Fecha en que dejó de estar vigente',
    CONSTRAINT fk_asignacion_incidencia
        FOREIGN KEY (incidencia_id) REFERENCES incidencia(id),
    CONSTRAINT fk_asignacion_usuario_origen
        FOREIGN KEY (asignado_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_asignacion_usuario_destino
        FOREIGN KEY (responsable_usuario_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_asignacion_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    INDEX idx_asignacion_inc_fecha (incidencia_id, asignado_en)
) ENGINE=InnoDB
COMMENT='Conserva el historial de responsables internos o proveedores asignados a una incidencia a lo largo de su atención.';

-- 18
CREATE TABLE actuacion_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la actuación',
    incidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Incidencia sobre la que se actuó',
    actor_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que ejecutó la acción',
    tipo_accion_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de acción formal registrada',
    descripcion TEXT NOT NULL COMMENT 'Detalle de la actuación',
    estado_anterior_id BIGINT UNSIGNED NULL COMMENT 'Estado previo',
    estado_nuevo_id BIGINT UNSIGNED NULL COMMENT 'Estado resultante',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la actuación',
    CONSTRAINT fk_actuacion_incidencia
        FOREIGN KEY (incidencia_id) REFERENCES incidencia(id),
    CONSTRAINT fk_actuacion_actor
        FOREIGN KEY (actor_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_actuacion_tipo_accion
        FOREIGN KEY (tipo_accion_id) REFERENCES tipo_accion_incidencia(id),
    CONSTRAINT fk_actuacion_estado_anterior
        FOREIGN KEY (estado_anterior_id) REFERENCES estado_incidencia(id),
    CONSTRAINT fk_actuacion_estado_nuevo
        FOREIGN KEY (estado_nuevo_id) REFERENCES estado_incidencia(id),
    INDEX idx_actuacion_inc_fecha (incidencia_id, creado_en)
) ENGINE=InnoDB
COMMENT='Bitácora cronológica de acciones y cambios de estado realizados durante la atención de una incidencia.';

-- 19
CREATE TABLE comentario_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del comentario',
    incidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Incidencia asociada',
    autor_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que escribió el comentario',
    comentario TEXT NOT NULL COMMENT 'Contenido del comentario',
    interno TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si solo puede verlo personal autorizado',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del comentario',
    CONSTRAINT fk_comentario_incidencia
        FOREIGN KEY (incidencia_id) REFERENCES incidencia(id),
    CONSTRAINT fk_comentario_autor
        FOREIGN KEY (autor_id) REFERENCES usuario_perfil(id),
    INDEX idx_comentario_inc_fecha (incidencia_id, creado_en)
) ENGINE=InnoDB
COMMENT='Registra comunicaciones vinculadas al ticket sin mezclar comentarios con cambios formales de estado.';

-- 20
CREATE TABLE evidencia_incidencia (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la evidencia',
    incidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Incidencia asociada',
    autor_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que adjuntó la evidencia',
    tipo_evidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de evidencia registrada',
    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre original o descriptivo del archivo',
    url_recurso VARCHAR(1000) NOT NULL COMMENT 'Referencia al recurso almacenado externamente',
    descripcion VARCHAR(500) NULL COMMENT 'Descripción de la evidencia',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT fk_evidencia_inc_incidencia
        FOREIGN KEY (incidencia_id) REFERENCES incidencia(id),
    CONSTRAINT fk_evidencia_inc_autor
        FOREIGN KEY (autor_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_evidencia_inc_tipo
        FOREIGN KEY (tipo_evidencia_id) REFERENCES tipo_evidencia(id),
    INDEX idx_evidencia_inc (incidencia_id)
) ENGINE=InnoDB
COMMENT='Almacena referencias a fotos, videos o documentos que sustentan el reporte y la atención de una incidencia.';

-- ============================================================
-- D. ACTIVOS Y MANTENIMIENTO PREVENTIVO
-- ============================================================

-- 21
CREATE TABLE tipo_activo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo de activo',
    codigo VARCHAR(40) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre visible',
    descripcion VARCHAR(255) NULL COMMENT 'Descripción general del tipo',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico'
) ENGINE=InnoDB
COMMENT='Catálogo de clases de activos sujetos a mantenimiento, como ascensores, bombas, portones o luces de emergencia.';

-- 22
CREATE TABLE estado_activo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    descripcion VARCHAR(255) NULL COMMENT 'Significado operativo',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del catálogo'
) ENGINE=InnoDB
COMMENT='Catálogo del estado operativo de los activos del condominio.';

-- 23
CREATE TABLE activo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del activo',
    codigo VARCHAR(40) NOT NULL UNIQUE COMMENT 'Código interno del activo',
    tipo_activo_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de activo',
    estado_activo_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado operativo vigente',
    nombre VARCHAR(120) NOT NULL COMMENT 'Nombre descriptivo',
    ubicacion VARCHAR(255) NOT NULL COMMENT 'Ubicación física',
    marca VARCHAR(80) NULL COMMENT 'Marca cuando sea conocida',
    modelo VARCHAR(80) NULL COMMENT 'Modelo cuando sea conocido',
    numero_serie VARCHAR(100) NULL COMMENT 'Número de serie cuando sea aplicable',
    fecha_instalacion DATE NULL COMMENT 'Fecha de instalación si se dispone de evidencia',
    descripcion VARCHAR(500) NULL COMMENT 'Observaciones generales',
    es_critico TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Marca activos de alta criticidad',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del registro',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
    CONSTRAINT fk_activo_tipo
        FOREIGN KEY (tipo_activo_id) REFERENCES tipo_activo(id),
    CONSTRAINT fk_activo_estado
        FOREIGN KEY (estado_activo_id) REFERENCES estado_activo(id),
    INDEX idx_activo_tipo (tipo_activo_id),
    INDEX idx_activo_critico (es_critico)
) ENGINE=InnoDB
COMMENT='Ficha técnica básica de cada equipo o instalación cuya vida operativa y mantenimiento deben ser trazables.';

-- 24
CREATE TABLE activo_proveedor (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la relación activo-proveedor',
    activo_id BIGINT UNSIGNED NOT NULL COMMENT 'Activo atendido',
    proveedor_id BIGINT UNSIGNED NOT NULL COMMENT 'Proveedor relacionado',
    tipo_relacion VARCHAR(40) NOT NULL DEFAULT 'MANTENIMIENTO' COMMENT 'Tipo de servicio o relación',
    desde DATE NULL COMMENT 'Fecha de inicio conocida de la relación',
    hasta DATE NULL COMMENT 'Fecha de fin conocida de la relación',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la relación',
    CONSTRAINT uq_activo_proveedor UNIQUE (activo_id, proveedor_id, tipo_relacion),
    CONSTRAINT fk_activo_proveedor_activo
        FOREIGN KEY (activo_id) REFERENCES activo(id),
    CONSTRAINT fk_activo_proveedor_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
) ENGINE=InnoDB
COMMENT='Relaciona activos con proveedores que realizan mantenimiento, soporte u otros servicios especializados.';

-- 25
CREATE TABLE frecuencia_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de frecuencia',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    cantidad SMALLINT UNSIGNED NOT NULL COMMENT 'Cantidad de unidades entre mantenimientos',
    unidad VARCHAR(20) NOT NULL COMMENT 'DIA, SEMANA, MES u otra unidad definida',
    descripcion VARCHAR(255) NULL COMMENT 'Descripción de la frecuencia',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico'
) ENGINE=InnoDB
COMMENT='Catálogo de periodicidades utilizadas para programar mantenimientos preventivos recurrentes.';

-- 26
CREATE TABLE estado_plan_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del catálogo'
) ENGINE=InnoDB
COMMENT='Catálogo del estado de un plan preventivo: activo, pausado, finalizado u otro estado controlado.';

-- 27
CREATE TABLE plan_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del plan',
    activo_id BIGINT UNSIGNED NOT NULL COMMENT 'Activo sujeto al plan',
    frecuencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Periodicidad programada',
    estado_plan_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado vigente del plan',
    responsable_id BIGINT UNSIGNED NULL COMMENT 'Responsable interno preferente',
    proveedor_id BIGINT UNSIGNED NULL COMMENT 'Proveedor preferente si corresponde',
    titulo VARCHAR(150) NOT NULL COMMENT 'Nombre del plan preventivo',
    descripcion VARCHAR(500) NULL COMMENT 'Alcance del mantenimiento',
    fecha_inicio DATE NOT NULL COMMENT 'Inicio de vigencia',
    proxima_fecha DATE NOT NULL COMMENT 'Próxima fecha programada',
    dias_alerta SMALLINT UNSIGNED NOT NULL DEFAULT 3 COMMENT 'Días de anticipación para generar alerta',
    creado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que registró el plan',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
    CONSTRAINT fk_plan_activo
        FOREIGN KEY (activo_id) REFERENCES activo(id),
    CONSTRAINT fk_plan_frecuencia
        FOREIGN KEY (frecuencia_id) REFERENCES frecuencia_mantenimiento(id),
    CONSTRAINT fk_plan_estado
        FOREIGN KEY (estado_plan_id) REFERENCES estado_plan_mantenimiento(id),
    CONSTRAINT fk_plan_responsable
        FOREIGN KEY (responsable_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_plan_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    CONSTRAINT fk_plan_creador
        FOREIGN KEY (creado_por_id) REFERENCES usuario_perfil(id),
    INDEX idx_plan_proxima_fecha (proxima_fecha)
) ENGINE=InnoDB
COMMENT='Define la programación recurrente de mantenimiento preventivo de un activo y sirve de origen para tareas periódicas.';

-- 28
CREATE TABLE estado_tarea_preventiva (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    es_estado_final TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si finaliza la tarea',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del catálogo'
) ENGINE=InnoDB
COMMENT='Catálogo del ciclo de vida de una tarea preventiva programada.';

-- 29
CREATE TABLE tarea_preventiva (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la tarea',
    plan_mantenimiento_id BIGINT UNSIGNED NULL COMMENT 'Plan recurrente que originó la tarea, si existe',
    activo_id BIGINT UNSIGNED NOT NULL COMMENT 'Activo a intervenir',
    responsable_id BIGINT UNSIGNED NULL COMMENT 'Responsable interno',
    proveedor_id BIGINT UNSIGNED NULL COMMENT 'Proveedor externo si corresponde',
    creado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que generó o registró la tarea',
    estado_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado vigente',
    titulo VARCHAR(150) NOT NULL COMMENT 'Nombre de la tarea',
    descripcion VARCHAR(500) NULL COMMENT 'Trabajo preventivo esperado',
    programada_para DATETIME NOT NULL COMMENT 'Fecha y hora programada',
    fecha_inicio DATETIME NULL COMMENT 'Inicio efectivo',
    fecha_fin DATETIME NULL COMMENT 'Fin efectivo',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación',
    CONSTRAINT fk_tarea_plan
        FOREIGN KEY (plan_mantenimiento_id) REFERENCES plan_mantenimiento(id),
    CONSTRAINT fk_tarea_activo
        FOREIGN KEY (activo_id) REFERENCES activo(id),
    CONSTRAINT fk_tarea_responsable
        FOREIGN KEY (responsable_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_tarea_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    CONSTRAINT fk_tarea_creador
        FOREIGN KEY (creado_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_tarea_estado
        FOREIGN KEY (estado_id) REFERENCES estado_tarea_preventiva(id),
    INDEX idx_tarea_programada (programada_para),
    INDEX idx_tarea_estado_fecha (estado_id, programada_para)
) ENGINE=InnoDB
COMMENT='Instancia concreta de un mantenimiento preventivo con fecha, responsable, proveedor y estado de ejecución.';

-- 30
CREATE TABLE intervencion_preventiva (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la intervención',
    tarea_preventiva_id BIGINT UNSIGNED NOT NULL COMMENT 'Tarea preventiva atendida',
    ejecutor_usuario_id BIGINT UNSIGNED NULL COMMENT 'Usuario interno que ejecutó',
    proveedor_id BIGINT UNSIGNED NULL COMMENT 'Proveedor que ejecutó cuando corresponda',
    acciones_realizadas TEXT NOT NULL COMMENT 'Detalle de trabajos realizados',
    observaciones TEXT NULL COMMENT 'Hallazgos u observaciones técnicas',
    costo DECIMAL(12,2) NULL COMMENT 'Costo registrado cuando exista evidencia autorizada',
    ejecutado_en DATETIME NOT NULL COMMENT 'Fecha y hora de ejecución',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT fk_intervencion_tarea
        FOREIGN KEY (tarea_preventiva_id) REFERENCES tarea_preventiva(id),
    CONSTRAINT fk_intervencion_usuario
        FOREIGN KEY (ejecutor_usuario_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_intervencion_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    INDEX idx_intervencion_tarea (tarea_preventiva_id),
    INDEX idx_intervencion_fecha (ejecutado_en)
) ENGINE=InnoDB
COMMENT='Registra la ejecución efectiva de un mantenimiento, sus acciones, observaciones, ejecutor y costo cuando corresponda.';

-- 31
CREATE TABLE evidencia_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de evidencia',
    intervencion_preventiva_id BIGINT UNSIGNED NOT NULL COMMENT 'Intervención respaldada',
    autor_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que registró la evidencia',
    tipo_evidencia_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de evidencia registrada',
    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre descriptivo u original',
    url_recurso VARCHAR(1000) NOT NULL COMMENT 'Referencia al recurso',
    descripcion VARCHAR(500) NULL COMMENT 'Descripción breve',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT fk_evidencia_man_intervencion
        FOREIGN KEY (intervencion_preventiva_id) REFERENCES intervencion_preventiva(id),
    CONSTRAINT fk_evidencia_man_autor
        FOREIGN KEY (autor_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_evidencia_man_tipo
        FOREIGN KEY (tipo_evidencia_id) REFERENCES tipo_evidencia(id),
    INDEX idx_evidencia_man_intervencion (intervencion_preventiva_id)
) ENGINE=InnoDB
COMMENT='Almacena las evidencias documentales o fotográficas asociadas a una intervención preventiva.';

-- 32
CREATE TABLE tipo_alerta_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo de alerta preventiva',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código técnico estable utilizado por Spring Boot',
    nombre VARCHAR(80) NOT NULL UNIQUE COMMENT 'Nombre visible del tipo de alerta',
    descripcion VARCHAR(255) NULL COMMENT 'Condición operativa que origina este tipo de alerta',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el tipo de alerta está habilitado'
) ENGINE=InnoDB
COMMENT='Catálogo de tipos de alerta preventiva del mantenimiento, principalmente mantenimiento próximo y mantenimiento vencido.';

-- 33
CREATE TABLE alerta_mantenimiento (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de la alerta',
    tarea_preventiva_id BIGINT UNSIGNED NOT NULL COMMENT 'Tarea preventiva que originó la alerta',
    tipo_alerta_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de alerta preventiva generada',
    mensaje VARCHAR(500) NOT NULL COMMENT 'Mensaje operativo generado por la alerta',
    generada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de generación',
    atendida TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si la alerta ya fue gestionada',
    atendida_en TIMESTAMP NULL COMMENT 'Fecha y hora de atención de la alerta',
    CONSTRAINT fk_alerta_tarea
        FOREIGN KEY (tarea_preventiva_id) REFERENCES tarea_preventiva(id),
    CONSTRAINT fk_alerta_tipo
        FOREIGN KEY (tipo_alerta_id) REFERENCES tipo_alerta_mantenimiento(id),
    INDEX idx_alerta_tarea_estado (tarea_preventiva_id, atendida),
    INDEX idx_alerta_tipo (tipo_alerta_id)
) ENGINE=InnoDB
COMMENT='Registra alertas operativas de mantenimientos próximos o vencidos para reducir el riesgo de omitir tareas preventivas.';

-- ============================================================
-- E. NOTIFICACIONES Y COMUNICADOS
-- ============================================================

-- 34
CREATE TABLE tipo_notificacion (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo',
    codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre visible',
    descripcion VARCHAR(255) NULL COMMENT 'Evento que genera este tipo de aviso',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico'
) ENGINE=InnoDB
COMMENT='Catálogo de eventos notificables del sistema, como cambios de estado o alertas de mantenimiento.';

-- 35
CREATE TABLE notificacion (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de notificación',
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario destinatario',
    tipo_notificacion_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de evento',
    incidencia_id BIGINT UNSIGNED NULL COMMENT 'Incidencia relacionada',
    tarea_preventiva_id BIGINT UNSIGNED NULL COMMENT 'Tarea preventiva relacionada',
    comunicado_id BIGINT UNSIGNED NULL COMMENT 'Reservado para vínculo con comunicado mediante lógica de aplicación',
    titulo VARCHAR(180) NOT NULL COMMENT 'Título del aviso',
    mensaje VARCHAR(500) NOT NULL COMMENT 'Contenido del aviso',
    leida TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Estado de lectura',
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    leida_en TIMESTAMP NULL COMMENT 'Fecha de lectura',
    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_notificacion_tipo
        FOREIGN KEY (tipo_notificacion_id) REFERENCES tipo_notificacion(id),
    CONSTRAINT fk_notificacion_incidencia
        FOREIGN KEY (incidencia_id) REFERENCES incidencia(id),
    CONSTRAINT fk_notificacion_tarea
        FOREIGN KEY (tarea_preventiva_id) REFERENCES tarea_preventiva(id),
    INDEX idx_notificacion_usuario_estado (usuario_id, leida, creada_en)
) ENGINE=InnoDB
COMMENT='Bandeja de notificaciones operativas dirigida a usuarios por eventos del flujo de incidencias y mantenimiento.';

-- 36
CREATE TABLE comunicado (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del comunicado',
    autor_id BIGINT UNSIGNED NOT NULL COMMENT 'Administrador autor',
    titulo VARCHAR(180) NOT NULL COMMENT 'Título del comunicado',
    contenido TEXT NOT NULL COMMENT 'Contenido del aviso',
    publicado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de publicación',
    vigente_desde DATETIME NULL COMMENT 'Inicio de vigencia',
    vigente_hasta DATETIME NULL COMMENT 'Fin de vigencia si corresponde',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico',
    CONSTRAINT fk_comunicado_autor
        FOREIGN KEY (autor_id) REFERENCES usuario_perfil(id)
) ENGINE=InnoDB
COMMENT='Registra comunicados operativos publicados por la administración para residentes autorizados.';

ALTER TABLE notificacion
    ADD CONSTRAINT fk_notificacion_comunicado
    FOREIGN KEY (comunicado_id) REFERENCES comunicado(id);

-- 37
CREATE TABLE comunicado_destinatario (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno del destinatario del comunicado',
    comunicado_id BIGINT UNSIGNED NOT NULL COMMENT 'Comunicado enviado',
    usuario_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario destinatario',
    leido TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Estado de lectura',
    leido_en TIMESTAMP NULL COMMENT 'Fecha de lectura',
    CONSTRAINT uq_comunicado_destinatario UNIQUE (comunicado_id, usuario_id),
    CONSTRAINT fk_comunicado_dest_comunicado
        FOREIGN KEY (comunicado_id) REFERENCES comunicado(id),
    CONSTRAINT fk_comunicado_dest_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario_perfil(id)
) ENGINE=InnoDB
COMMENT='Relaciona comunicados con sus destinatarios y permite registrar lectura individual.';


-- ============================================================
-- F. CONTROL DE VISITAS POR UNIDAD RESIDENCIAL
-- Decisión de alcance incorporada por el Product Owner.
-- Cada autorización se vincula obligatoriamente a una unidad.
-- Los datos personales deben ser mínimos y usarse únicamente
-- con autorización; en ambientes públicos se usarán datos de prueba.
-- ============================================================

-- 38
CREATE TABLE tipo_visita (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del tipo de visita',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código técnico estable del tipo de visita',
    nombre VARCHAR(80) NOT NULL UNIQUE COMMENT 'Nombre visible del tipo de visita',
    descripcion VARCHAR(255) NULL COMMENT 'Descripción del uso previsto para este tipo de visita',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el tipo de visita está habilitado'
) ENGINE=InnoDB
COMMENT='Catálogo utilizado para clasificar las visitas autorizadas por los residentes de una unidad.';

-- 39
CREATE TABLE estado_visita (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado de visita',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código técnico estable del estado',
    nombre VARCHAR(80) NOT NULL UNIQUE COMMENT 'Nombre visible del estado',
    es_final TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el estado termina el ciclo de la autorización',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el estado puede utilizarse'
) ENGINE=InnoDB
COMMENT='Catálogo del ciclo de vida de una autorización de visita: preautorizada, ingresada, finalizada, cancelada o vencida.';

-- 40
CREATE TABLE visita (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno de la autorización de visita',
    codigo VARCHAR(40) NOT NULL UNIQUE COMMENT 'Código único de la autorización',
    unidad_id BIGINT UNSIGNED NOT NULL COMMENT 'Departamento o unidad que recibirá la visita',
    autorizado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Residente autorizado que registra la visita',
    tipo_visita_id BIGINT UNSIGNED NOT NULL COMMENT 'Tipo de visita registrada',
    estado_visita_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado vigente de la autorización',
    nombre_visitante VARCHAR(150) NOT NULL COMMENT 'Nombre declarado de la persona visitante',
    documento_visitante VARCHAR(30) NULL COMMENT 'Documento de identificación, solo cuando sea necesario y autorizado',
    observacion VARCHAR(500) NULL COMMENT 'Información operativa adicional de la autorización',
    vigente_desde DATETIME NOT NULL COMMENT 'Inicio de vigencia de la autorización',
    vigente_hasta DATETIME NOT NULL COMMENT 'Fin de vigencia de la autorización',
    codigo_acceso VARCHAR(120) NULL UNIQUE COMMENT 'Código o token de acceso generado por la aplicación, si se utiliza',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creación',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación de la autorización',
    CONSTRAINT fk_visita_unidad
        FOREIGN KEY (unidad_id) REFERENCES unidad_residencial(id),
    CONSTRAINT fk_visita_autorizado_por
        FOREIGN KEY (autorizado_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_visita_tipo
        FOREIGN KEY (tipo_visita_id) REFERENCES tipo_visita(id),
    CONSTRAINT fk_visita_estado
        FOREIGN KEY (estado_visita_id) REFERENCES estado_visita(id),
    CONSTRAINT chk_visita_vigencia CHECK (vigente_hasta > vigente_desde),
    INDEX idx_visita_unidad_vigencia (unidad_id, vigente_desde, vigente_hasta),
    INDEX idx_visita_estado (estado_visita_id)
) ENGINE=InnoDB
COMMENT='Registra la preautorización de una visita para una unidad residencial, incluyendo visitante, vigencia, tipo y estado.';

-- 41
CREATE TABLE acceso_visita (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del registro de acceso',
    visita_id BIGINT UNSIGNED NOT NULL COMMENT 'Autorización de visita utilizada',
    ingreso_registrado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario de portería o administración que registra el ingreso',
    salida_registrada_por_id BIGINT UNSIGNED NULL COMMENT 'Usuario que registra la salida',
    fecha_ingreso DATETIME NOT NULL COMMENT 'Fecha y hora efectiva de ingreso',
    fecha_salida DATETIME NULL COMMENT 'Fecha y hora efectiva de salida',
    observacion_ingreso VARCHAR(300) NULL COMMENT 'Observación operativa registrada al ingreso',
    observacion_salida VARCHAR(300) NULL COMMENT 'Observación operativa registrada a la salida',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    CONSTRAINT fk_acceso_visita
        FOREIGN KEY (visita_id) REFERENCES visita(id),
    CONSTRAINT fk_acceso_ingreso_usuario
        FOREIGN KEY (ingreso_registrado_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_acceso_salida_usuario
        FOREIGN KEY (salida_registrada_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT chk_acceso_fechas CHECK (fecha_salida IS NULL OR fecha_salida >= fecha_ingreso),
    INDEX idx_acceso_visita (visita_id),
    INDEX idx_acceso_ingreso (fecha_ingreso)
) ENGINE=InnoDB
COMMENT='Registra el ingreso y salida efectivos de una visita previamente autorizada para una unidad residencial.';

-- ============================================================
-- G. CONSULTA ADMINISTRATIVA BÁSICA DE CUOTAS
-- ============================================================

-- 42
CREATE TABLE estado_cuota (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del estado',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código estable',
    nombre VARCHAR(60) NOT NULL UNIQUE COMMENT 'Nombre visible',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del catálogo'
) ENGINE=InnoDB
COMMENT='Catálogo básico para indicar el estado administrativo de una cuota sin convertir el sistema en una solución contable integral.';

-- 43
CREATE TABLE cuota_unidad (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador de cuota',
    unidad_id BIGINT UNSIGNED NOT NULL COMMENT 'Unidad residencial asociada',
    estado_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado administrativo vigente',
    actualizado_por_id BIGINT UNSIGNED NULL COMMENT 'Usuario que realizó la última actualización',
    periodo CHAR(7) NOT NULL COMMENT 'Periodo YYYY-MM',
    concepto VARCHAR(150) NOT NULL COMMENT 'Concepto de la cuota',
    monto DECIMAL(12,2) NOT NULL COMMENT 'Monto informado',
    fecha_vencimiento DATE NOT NULL COMMENT 'Fecha de vencimiento',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
    CONSTRAINT fk_cuota_unidad
        FOREIGN KEY (unidad_id) REFERENCES unidad_residencial(id),
    CONSTRAINT fk_cuota_estado
        FOREIGN KEY (estado_id) REFERENCES estado_cuota(id),
    CONSTRAINT fk_cuota_actualizado_por
        FOREIGN KEY (actualizado_por_id) REFERENCES usuario_perfil(id),
    CONSTRAINT uq_cuota_unidad_periodo_concepto
        UNIQUE (unidad_id, periodo, concepto),
    INDEX idx_cuota_unidad_periodo (unidad_id, periodo),
    INDEX idx_cuota_estado_vencimiento (estado_id, fecha_vencimiento)
) ENGINE=InnoDB
COMMENT='Registra información básica de cuotas por unidad para consulta de periodo, concepto, monto, vencimiento y estado.';

-- 44
CREATE TABLE movimiento_cuota (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del movimiento',
    cuota_id BIGINT UNSIGNED NOT NULL COMMENT 'Cuota afectada',
    actor_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que realizó la modificación',
    estado_anterior_id BIGINT UNSIGNED NULL COMMENT 'Estado previo',
    estado_nuevo_id BIGINT UNSIGNED NOT NULL COMMENT 'Estado resultante',
    observacion VARCHAR(500) NULL COMMENT 'Motivo o referencia de la modificación',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del movimiento',
    CONSTRAINT fk_mov_cuota
        FOREIGN KEY (cuota_id) REFERENCES cuota_unidad(id),
    CONSTRAINT fk_mov_cuota_actor
        FOREIGN KEY (actor_id) REFERENCES usuario_perfil(id),
    CONSTRAINT fk_mov_cuota_estado_anterior
        FOREIGN KEY (estado_anterior_id) REFERENCES estado_cuota(id),
    CONSTRAINT fk_mov_cuota_estado_nuevo
        FOREIGN KEY (estado_nuevo_id) REFERENCES estado_cuota(id),
    INDEX idx_mov_cuota_fecha (cuota_id, creado_en)
) ENGINE=InnoDB
COMMENT='Historial de cambios del estado administrativo de una cuota para mantener trazabilidad de actualización.';

-- 45
CREATE TABLE documento_pago (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del documento',
    cuota_id BIGINT UNSIGNED NOT NULL COMMENT 'Cuota asociada',
    cargado_por_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que registró el documento',
    tipo VARCHAR(40) NOT NULL COMMENT 'Tipo de documento disponible',
    nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre descriptivo u original',
    url_recurso VARCHAR(1000) NOT NULL COMMENT 'Referencia al documento almacenado',
    fecha_documento DATE NULL COMMENT 'Fecha del documento',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
    CONSTRAINT fk_documento_pago_cuota
        FOREIGN KEY (cuota_id) REFERENCES cuota_unidad(id),
    CONSTRAINT fk_documento_pago_usuario
        FOREIGN KEY (cargado_por_id) REFERENCES usuario_perfil(id),
    INDEX idx_documento_pago_cuota (cuota_id)
) ENGINE=InnoDB
COMMENT='Asocia constancias, boletas u otros documentos disponibles a una cuota para consulta administrativa básica.';

-- ============================================================
-- H. AUDITORÍA Y CONFIGURACIÓN TÉCNICA
-- ============================================================

-- 46
CREATE TABLE auditoria_sistema (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del evento de auditoría',
    usuario_id BIGINT UNSIGNED NULL COMMENT 'Usuario que originó la acción, si está identificado',
    accion VARCHAR(80) NOT NULL COMMENT 'Acción realizada',
    entidad VARCHAR(80) NOT NULL COMMENT 'Entidad o módulo afectado',
    entidad_id VARCHAR(80) NULL COMMENT 'Identificador lógico del registro afectado',
    detalle TEXT NULL COMMENT 'Información adicional no sensible sobre la operación',
    direccion_ip VARCHAR(45) NULL COMMENT 'IP registrada cuando técnicamente corresponda',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del evento',
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario_perfil(id),
    INDEX idx_auditoria_usuario_fecha (usuario_id, creado_en),
    INDEX idx_auditoria_entidad (entidad, entidad_id)
) ENGINE=InnoDB
COMMENT='Bitácora técnica de acciones relevantes para apoyar trazabilidad, seguridad y soporte del sistema.';

-- 47
CREATE TABLE parametro_sistema (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador del parámetro',
    clave VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave técnica única',
    valor VARCHAR(1000) NOT NULL COMMENT 'Valor configurable',
    descripcion VARCHAR(255) NOT NULL COMMENT 'Propósito del parámetro',
    editable TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Indica si puede modificarse desde administración',
    actualizado_por_id BIGINT UNSIGNED NULL COMMENT 'Último usuario que modificó el valor',
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación',
    CONSTRAINT fk_parametro_usuario
        FOREIGN KEY (actualizado_por_id) REFERENCES usuario_perfil(id)
) ENGINE=InnoDB
COMMENT='Centraliza parámetros operativos que pueden variar sin modificar el código fuente, como anticipación de alertas o límites configurables.';

-- ============================================================
-- I. DATOS MAESTROS INICIALES
-- Solo catálogos técnicos. No se crean datos operativos ficticios.
-- ============================================================

-- Datos estructurales confirmados del caso piloto.
-- La dirección exacta se mantiene NULL porque no está confirmada en la evidencia utilizada.
INSERT INTO condominio (nombre, distrito, provincia, departamento, direccion) VALUES
('Condominio Nuevo Alcázar', 'Rímac', 'Lima', 'Lima', NULL);

INSERT INTO torre (condominio_id, codigo, nombre, pisos)
SELECT c.id, x.codigo, x.nombre, 8
FROM condominio c
JOIN (
    SELECT 'T01' AS codigo, 'Torre 1' AS nombre UNION ALL
    SELECT 'T02', 'Torre 2' UNION ALL
    SELECT 'T03', 'Torre 3' UNION ALL
    SELECT 'T04', 'Torre 4' UNION ALL
    SELECT 'T05', 'Torre 5' UNION ALL
    SELECT 'T06', 'Torre 6' UNION ALL
    SELECT 'T07', 'Torre 7' UNION ALL
    SELECT 'T08', 'Torre 8' UNION ALL
    SELECT 'T09', 'Torre 9' UNION ALL
    SELECT 'T10', 'Torre 10' UNION ALL
    SELECT 'T11', 'Torre 11' UNION ALL
    SELECT 'T12', 'Torre 12'
) x
WHERE c.nombre = 'Condominio Nuevo Alcázar';

INSERT INTO rol (codigo, nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador', 'Gestiona incidencias, mantenimiento, comunicados y consulta administrativa.'),
('RESIDENTE', 'Residente', 'Registra incidencias, consulta su estado y confirma o reabre la solución.'),
('MANTENIMIENTO', 'Mantenimiento', 'Atiende trabajos asignados y registra actuaciones e intervenciones.'),
('PORTERIA_SEGURIDAD', 'Portería/Seguridad', 'Valida autorizaciones de visita y registra ingresos o salidas.');

INSERT INTO permiso (codigo, nombre, modulo, descripcion) VALUES
('INCIDENCIA_CREAR', 'Crear incidencia', 'INCIDENCIAS', 'Permite registrar una nueva incidencia.'),
('INCIDENCIA_CONSULTAR_PROPIA', 'Consultar incidencia propia', 'INCIDENCIAS', 'Permite consultar incidencias relacionadas al usuario.'),
('INCIDENCIA_GESTIONAR', 'Gestionar incidencias', 'INCIDENCIAS', 'Permite clasificar, priorizar y asignar incidencias.'),
('INCIDENCIA_ATENDER', 'Atender incidencias', 'INCIDENCIAS', 'Permite registrar diagnóstico, acciones y solución.'),
('MANTENIMIENTO_GESTIONAR', 'Gestionar mantenimiento', 'MANTENIMIENTO', 'Permite registrar activos, planes y tareas preventivas.'),
('MANTENIMIENTO_ATENDER', 'Atender mantenimiento', 'MANTENIMIENTO', 'Permite registrar intervenciones preventivas.'),
('COMUNICADO_PUBLICAR', 'Publicar comunicados', 'COMUNICACION', 'Permite publicar comunicados operativos.'),
('CUOTA_CONSULTAR_PROPIA', 'Consultar cuotas propias', 'CUOTAS', 'Permite consultar cuotas de unidades autorizadas.'),
('CUOTA_GESTIONAR', 'Gestionar cuotas', 'CUOTAS', 'Permite registrar o actualizar estados administrativos básicos.'),
('VISITA_CREAR', 'Autorizar visita', 'VISITAS', 'Permite registrar una autorización de visita para una unidad autorizada.'),
('VISITA_CONSULTAR_PROPIA', 'Consultar visitas propias', 'VISITAS', 'Permite consultar las visitas asociadas a unidades autorizadas.'),
('VISITA_GESTIONAR_ACCESO', 'Gestionar acceso de visita', 'VISITAS', 'Permite validar una autorización y registrar ingreso o salida.');

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'ADMINISTRADOR'
  AND p.codigo IN (
      'INCIDENCIA_GESTIONAR',
      'MANTENIMIENTO_GESTIONAR',
      'COMUNICADO_PUBLICAR',
      'CUOTA_GESTIONAR'
  );

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'RESIDENTE'
  AND p.codigo IN (
      'INCIDENCIA_CREAR',
      'INCIDENCIA_CONSULTAR_PROPIA',
      'CUOTA_CONSULTAR_PROPIA',
      'VISITA_CREAR',
      'VISITA_CONSULTAR_PROPIA'
  );

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'MANTENIMIENTO'
  AND p.codigo IN (
      'INCIDENCIA_ATENDER',
      'MANTENIMIENTO_ATENDER'
  );


INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'PORTERIA_SEGURIDAD'
  AND p.codigo IN (
      'VISITA_GESTIONAR_ACCESO'
  );

INSERT INTO categoria_incidencia (codigo, nombre, descripcion) VALUES
('ELECTRICIDAD', 'Electricidad', 'Problemas eléctricos de unidades o áreas comunes.'),
('SANITARIO', 'Sanitario', 'Fugas, filtraciones u otros problemas sanitarios.'),
('LIMPIEZA', 'Limpieza', 'Incidencias relacionadas con limpieza operativa.'),
('SEGURIDAD', 'Seguridad', 'Incidencias que afectan controles o condiciones de seguridad.'),
('ASCENSOR', 'Ascensor', 'Problemas relacionados con ascensores.'),
('BOMBAS', 'Bombas / cisternas', 'Problemas del sistema de bombeo o cisternas.'),
('AREAS_COMUNES', 'Áreas comunes', 'Incidencias en espacios de uso común.'),
('OTRO', 'Otro', 'Incidencias que requieren clasificación posterior.');

INSERT INTO prioridad_incidencia (codigo, nombre, orden, descripcion) VALUES
('BAJA', 'Baja', 1, 'Puede atenderse dentro de la planificación ordinaria.'),
('MEDIA', 'Media', 2, 'Requiere atención priorizada sin condición crítica inmediata.'),
('ALTA', 'Alta', 3, 'Puede afectar operación relevante o generar impacto significativo.'),
('CRITICA', 'Crítica', 4, 'Requiere atención inmediata por impacto operativo o de seguridad.');

INSERT INTO estado_incidencia (codigo, nombre, orden, es_estado_final) VALUES
('REPORTADA', 'Reportada', 1, 0),
('CLASIFICADA', 'Clasificada', 2, 0),
('ASIGNADA', 'Asignada', 3, 0),
('EN_ATENCION', 'En atención', 4, 0),
('SOLUCIONADA', 'Solucionada - pendiente de confirmación', 5, 0),
('CERRADA', 'Cerrada', 6, 1),
('REABIERTA', 'Reabierta', 7, 0);

INSERT INTO tipo_accion_incidencia (codigo, nombre, descripcion) VALUES
('CLASIFICACION', 'Clasificación', 'Clasificación funcional de la incidencia.'),
('PRIORIZACION', 'Priorización', 'Asignación o modificación de prioridad.'),
('ASIGNACION', 'Asignación', 'Asignación de responsable interno o proveedor.'),
('ACEPTACION', 'Aceptación de trabajo', 'El responsable acepta la atención asignada.'),
('DIAGNOSTICO', 'Diagnóstico', 'Registro del diagnóstico técnico u operativo.'),
('ACCION_REALIZADA', 'Acción realizada', 'Registro de una acción ejecutada durante la atención.'),
('SOLUCION', 'Solución', 'Registro de la solución propuesta o aplicada.'),
('CONFIRMACION', 'Confirmación', 'Confirmación del cierre por el actor autorizado.'),
('REAPERTURA', 'Reapertura', 'Reapertura del mismo caso porque la solución no fue suficiente.');

INSERT INTO tipo_evidencia (codigo, nombre, descripcion) VALUES
('FOTO', 'Foto', 'Evidencia fotográfica.'),
('VIDEO', 'Video', 'Evidencia audiovisual.'),
('DOCUMENTO', 'Documento', 'Informe, constancia u otro archivo documental.'),
('OTRO', 'Otro', 'Evidencia autorizada que no corresponde a los tipos anteriores.');

INSERT INTO tipo_activo (codigo, nombre, descripcion) VALUES
('ASCENSOR', 'Ascensor', 'Equipo de transporte vertical.'),
('BOMBA_AGUA', 'Bomba de agua / cisterna', 'Equipo del sistema de bombeo de agua.'),
('CERCO_ELECTRICO', 'Cerco eléctrico', 'Sistema de seguridad perimetral.'),
('PUERTA_VEHICULAR', 'Puerta vehicular', 'Portón o puerta automática de acceso vehicular.'),
('SISTEMA_CONTRA_INCENDIO', 'Sistema contra incendio', 'Equipos asociados a prevención y respuesta contra incendios.'),
('LUZ_EMERGENCIA', 'Luz de emergencia', 'Equipo de iluminación de emergencia.'),
('OTRO', 'Otro', 'Activo que requiere clasificación posterior.');

INSERT INTO estado_activo (codigo, nombre, descripcion) VALUES
('OPERATIVO', 'Operativo', 'Activo disponible para operación normal.'),
('EN_MANTENIMIENTO', 'En mantenimiento', 'Activo temporalmente intervenido.'),
('FUERA_SERVICIO', 'Fuera de servicio', 'Activo no disponible para operación.'),
('BAJA', 'Dado de baja', 'Activo retirado definitivamente de operación.');

INSERT INTO frecuencia_mantenimiento (codigo, nombre, cantidad, unidad, descripcion) VALUES
('MENSUAL', 'Mensual', 1, 'MES', 'Una vez cada mes.'),
('BIMESTRAL', 'Bimestral', 2, 'MES', 'Una vez cada dos meses.'),
('TRIMESTRAL', 'Trimestral', 3, 'MES', 'Una vez cada tres meses.'),
('SEMESTRAL', 'Semestral', 6, 'MES', 'Una vez cada seis meses.'),
('ANUAL', 'Anual', 12, 'MES', 'Una vez cada doce meses.');

INSERT INTO estado_plan_mantenimiento (codigo, nombre) VALUES
('ACTIVO', 'Activo'),
('PAUSADO', 'Pausado'),
('FINALIZADO', 'Finalizado');

INSERT INTO estado_tarea_preventiva (codigo, nombre, es_estado_final) VALUES
('PROGRAMADA', 'Programada', 0),
('EN_EJECUCION', 'En ejecución', 0),
('EJECUTADA', 'Ejecutada', 1),
('VENCIDA', 'Vencida', 0),
('CANCELADA', 'Cancelada', 1);

INSERT INTO tipo_alerta_mantenimiento (codigo, nombre, descripcion) VALUES
('PROXIMA', 'Mantenimiento próximo', 'La tarea preventiva se aproxima a la fecha programada y requiere seguimiento.'),
('VENCIDA', 'Mantenimiento vencido', 'La fecha programada venció sin registrarse la ejecución de la tarea.');

INSERT INTO tipo_notificacion (codigo, nombre, descripcion) VALUES
('INCIDENCIA_ESTADO', 'Cambio de estado de incidencia', 'Aviso generado cuando cambia el estado de un ticket.'),
('INCIDENCIA_ASIGNADA', 'Incidencia asignada', 'Aviso asociado a la asignación de un responsable.'),
('MANTENIMIENTO_PROXIMO', 'Mantenimiento próximo', 'Aviso previo a una fecha preventiva programada.'),
('MANTENIMIENTO_VENCIDO', 'Mantenimiento vencido', 'Aviso por tarea preventiva no ejecutada dentro del plazo.'),
('COMUNICADO_PUBLICADO', 'Comunicado publicado', 'Aviso de un nuevo comunicado operativo.');

INSERT INTO tipo_visita (codigo, nombre, descripcion) VALUES
('GENERAL', 'Visita general', 'Visita personal autorizada por un residente.'),
('DELIVERY', 'Delivery', 'Ingreso autorizado para entrega de pedidos o productos.'),
('SERVICIO_TECNICO', 'Servicio técnico', 'Ingreso de personal técnico autorizado por el residente.'),
('PROVEEDOR', 'Proveedor', 'Ingreso de proveedor previamente autorizado.'),
('OTRO', 'Otro', 'Tipo de visita que requiere una descripción complementaria.');

INSERT INTO estado_visita (codigo, nombre, es_final) VALUES
('PREAUTORIZADA', 'Preautorizada', 0),
('INGRESADA', 'Ingresada', 0),
('FINALIZADA', 'Finalizada', 1),
('CANCELADA', 'Cancelada', 1),
('VENCIDA', 'Vencida', 1);

INSERT INTO estado_cuota (codigo, nombre) VALUES
('PENDIENTE', 'Pendiente'),
('PAGADA', 'Pagada'),
('VENCIDA', 'Vencida'),
('OBSERVADA', 'Observada');

-- Parámetros técnicos iniciales; no son métricas reales del condominio.
INSERT INTO parametro_sistema (clave, valor, descripcion, editable) VALUES
('INCIDENCIA_PREFIJO', 'INC', 'Prefijo técnico para códigos de incidencia.', 1),
('ALERTA_MANTENIMIENTO_DIAS_DEFAULT', '3', 'Días de anticipación predeterminados para alertas preventivas.', 1);


INSERT INTO usuario_perfil (firebase_uid, rol_id, nombres, apellidos, correo, telefono, activo) 
VALUES
('xKw25qOefnZgibw6UF9DqP2HVZ93', 2, 'Residente2', 'Prueba2', 'residente2@gmail.com', NULL, 1),
('00p4Xu6jBDdRXh32renasBtHpdc2', 2, 'Residente', 'Prueba', 'residente@gmail.com', NULL, 1),
('Xq183fNLCyQv1AtM3GsMoArDQu32', 1, 'Administrador', 'Prueba', 'administrador@gmail.com', NULL, 1),
('up35jAU1wDdEiOrn0G5QuhMg90n2', 3, 'Mantenimiento', 'Prueba', 'mantenimiento@gmail.com', NULL, 1),
('dS3WYVnlpicuhN3sr5ufTfo6a4G2', 4, 'Portería', 'Seguridad', 'porteria@gmail.com', NULL, 1);

INSERT INTO unidad_residencial ( torre_id, piso, numero, referencia, activo) 
VALUES
    (1, 1, '101', 'Cerca de la entrada', 1),
    (1, 2, '201', 'Frente al ascensor', 1),
    (1, 3, '301', 'Lado derecho del pasillo', 1),
    (1, 4, '401', 'Cerca de las escaleras', 1),
	(2, 1, '102', 'Cerca de las escaleras', 1),
    (2, 2, '202', 'Frente al ascensor', 1),
    (2, 3, '302', 'Al fondo del pasillo', 1),
    (2, 4, '402', 'Cerca de la entrada', 1);
	

INSERT INTO usuario_unidad ( usuario_id, unidad_id, relacion, es_principal, activo, creado_en )
SELECT u.id, ur.id, 'RESIDENTE', 1, 1, NOW()
FROM usuario_perfil u
JOIN unidad_residencial ur ON ur.piso = 1 AND ur.numero = '101'
JOIN torre t ON t.id = ur.torre_id AND t.codigo = 'T01'
WHERE u.correo = 'residente@gmail.com';

INSERT INTO usuario_unidad ( usuario_id, unidad_id, relacion, es_principal, activo, creado_en )
SELECT u.id, ur.id, 'RESIDENTE', 1, 1, NOW()
FROM usuario_perfil u
JOIN unidad_residencial ur ON ur.piso = 3 AND ur.numero = '302'
JOIN torre t ON t.id = ur.torre_id AND t.codigo = 'T02'
WHERE u.correo = 'residente2@gmail.com';
-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- credenciales
/*
residente@gmail.com // residente
residente2@gmail.com // residente2
administrador@gmail.com // administrador
mantenimiento@gmail.com // mantenimiento
porteria@gmail.com // porteria
*/
-- ============================================================

