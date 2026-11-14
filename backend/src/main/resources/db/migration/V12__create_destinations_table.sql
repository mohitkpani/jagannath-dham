
CREATE TABLE destinations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    district VARCHAR(100) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT,
    famous_for VARCHAR(500),
    best_season VARCHAR(100),
    image_url VARCHAR(1000) NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id)
);
