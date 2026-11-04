CREATE TABLE IF NOT EXISTS clientes (
    id_negociacion BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    id_contacto BIGINT UNSIGNED NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL DEFAULT '',
    nombre_completo VARCHAR(511) NOT NULL,
    telefono VARCHAR(100) NULL,
    creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    actualizado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_clientes_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
