USE apitrini_db;

CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE rucher (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE relations_user_rucher (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id_fk INT NOT NULL,
    rucher_id_fk INT NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    FOREIGN KEY (user_id_fk) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (rucher_id_fk) REFERENCES apiary(id) ON DELETE CASCADE
);

CREATE TABLE ruche (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    rucher_id_fk INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (rucher_id_fk) REFERENCES apiary(id) ON DELETE CASCADE
);

CREATE TABLE analyse (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    picture_path VARCHAR(255) NOT NULL,
    varroa_count INT,
    ruche_id_fk INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (ruche_id_fk) REFERENCES hive(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_ruche_rucher ON hive(apiary_id_fk);
CREATE INDEX idx_analyse_ruche ON analysis(hive_id_fk);