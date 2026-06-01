CREATE TABLE halls
(
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    description CLOB
);

CREATE TABLE exhibits
(
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hall_id     NUMBER        NOT NULL,
    title       VARCHAR2(200) NOT NULL,
    creator     VARCHAR2(100),
    description CLOB,
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

-- ==========================================
-- 3. 테스트용 기본 데이터 매칭 (샘플 INSERT)
-- ==========================================
INSERT INTO halls (name, description)
VALUES ('제1 미술관', '후기 인상주의 및 고전 미술 전시관');

-- 방금 넣은 미술관 ID(1)를 기반으로 고흐 작품 추가
INSERT INTO exhibits (hall_id, title, creator, description, thumbnail_url)
VALUES (1, '별이 빛나는 밤 (The Starry Night)', '빈센트 반 고흐 (Vincent van Gogh)',
        '1889년 작품으로, 요동치는 꿈틀거리는 듯한 붓놀림과 강렬한 푸른색, 소용돌이치는 노란 별빛이 특징인 후기 인상주의의 대표작입니다.',
        'https://sipilodxmcjbuvwmtprm.supabase.co/storage/v1/object/public/museum-pic/The%20Starry%20Night.jpg');

-- 고흐 작품 ID(1)에 매칭되는 가상 공간 3D 중심 좌표 추가 (예시: X:10, Y:2, Z:-5)
INSERT INTO exhibit_positions (exhibit_id, pos_x, pos_y, pos_z)
VALUES (1, 10.0000, 2.0000, -5.0000);

COMMIT;