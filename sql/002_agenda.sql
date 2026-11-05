CREATE TABLE IF NOT EXISTS chatfuel_perfiles (
  codigo VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  telefono VARCHAR(20) CHARACTER SET ascii NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL DEFAULT 'Contacto WhatsApp',
  conversacion VARCHAR(160) NULL,
  datos JSON NOT NULL,
  creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatfuel_citas (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  cliente_codigo VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  asesor_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  bitrix_usuario_id VARCHAR(20) CHARACTER SET ascii NOT NULL,
  bitrix_evento_id VARCHAR(20) CHARACTER SET ascii NULL,
  clave_idempotencia VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  inicio DATETIME(3) NOT NULL,
  fin DATETIME(3) NOT NULL,
  estado VARCHAR(16) NOT NULL,
  solicitud JSON NOT NULL,
  respuesta JSON NULL,
  creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX agenda_intervalos (estado, inicio, fin),
  INDEX agenda_cliente (cliente_codigo, creado_en),
  CONSTRAINT agenda_perfil_fk FOREIGN KEY (cliente_codigo) REFERENCES chatfuel_perfiles(codigo),
  CONSTRAINT agenda_intervalo CHECK (fin > inicio),
  CONSTRAINT agenda_estado CHECK (estado IN ('pending','confirmed','cancelled','failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chatfuel_comentarios (
  huella CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  negociacion_id VARCHAR(20) CHARACTER SET ascii NOT NULL,
  comentario_id VARCHAR(20) CHARACTER SET ascii NULL,
  estado VARCHAR(16) NOT NULL DEFAULT 'pending',
  creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
