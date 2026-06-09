-- Oracle schema for the virtual 3D exhibition backend.
-- Matches the current JPA entities under backend/src/main/java/com/example/aiexhibition.

CREATE TABLE artist
(
    id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name      VARCHAR2(255),
    biography VARCHAR2(4000)
);

CREATE TABLE halls
(
    id                  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                VARCHAR2(100) NOT NULL,
    description         CLOB,
    camera_y            NUMBER(10, 4),
    wall_color          VARCHAR2(50),
    floor_color         VARCHAR2(50),
    ceiling_color       VARCHAR2(50),
    ambient_light_color VARCHAR2(50),
    light_intensity     NUMBER(10, 4)
);

CREATE TABLE exhibits
(
    id                NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hall_id           NUMBER        NOT NULL,
    title             VARCHAR2(200) NOT NULL,
    creator           VARCHAR2(100),
    description       CLOB,
    type              VARCHAR2(50),
    content_url       VARCHAR2(1000),
    wall_index        NUMBER(10),
    rotation_y        NUMBER(18, 10),
    scale             NUMBER(10, 4),
    wide              NUMBER(1),
    thumbnail_url     VARCHAR2(1000),
    portal_target_x   NUMBER(10, 4),
    portal_target_z   NUMBER(10, 4),
    portal_target_yaw NUMBER(18, 10),
    CONSTRAINT ck_exhibits_wide CHECK (wide IN (0, 1) OR wide IS NULL),
    CONSTRAINT fk_exhibits_hall FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE CASCADE
);

CREATE TABLE exhibit_positions
(
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exhibit_id NUMBER        NOT NULL UNIQUE,
    pos_x      NUMBER(10, 4) NOT NULL,
    pos_y      NUMBER(10, 4) NOT NULL,
    pos_z      NUMBER(10, 4) NOT NULL,
    CONSTRAINT fk_positions_exhibit FOREIGN KEY (exhibit_id) REFERENCES exhibits (id) ON DELETE CASCADE
);

CREATE TABLE visitor
(
    id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nickname VARCHAR2(255),
    email    VARCHAR2(255)
);

CREATE TABLE ticket
(
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    visitor_id NUMBER,
    issued_at  TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_ticket_visitor FOREIGN KEY (visitor_id) REFERENCES visitor (id) ON DELETE SET NULL
);

CREATE TABLE view_history
(
    id               NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    visitor_id       NUMBER,
    exhibit_id       NUMBER,
    viewed_at        TIMESTAMP,
    duration_seconds NUMBER(10),
    CONSTRAINT fk_view_history_visitor FOREIGN KEY (visitor_id) REFERENCES visitor (id) ON DELETE SET NULL,
    CONSTRAINT fk_view_history_exhibit FOREIGN KEY (exhibit_id) REFERENCES exhibits (id) ON DELETE SET NULL
);

CREATE TABLE exhibit_keyword
(
    id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exhibit_id NUMBER,
    keyword    VARCHAR2(255),
    CONSTRAINT fk_exhibit_keyword_exhibit FOREIGN KEY (exhibit_id) REFERENCES exhibits (id) ON DELETE CASCADE
);

CREATE INDEX idx_exhibits_hall_id ON exhibits (hall_id);
CREATE INDEX idx_ticket_visitor_id ON ticket (visitor_id);
CREATE INDEX idx_view_history_visitor_id ON view_history (visitor_id);
CREATE INDEX idx_view_history_exhibit_id ON view_history (exhibit_id);
CREATE INDEX idx_exhibit_keyword_exhibit_id ON exhibit_keyword (exhibit_id);
CREATE INDEX idx_exhibit_keyword_keyword ON exhibit_keyword (keyword);

COMMIT;
