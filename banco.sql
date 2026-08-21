CREATE DATABASE gamerverse;
USE gamerverse;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin','cliente') DEFAULT 'cliente'
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    preco DECIMAL(10,2),
    estoque INT,
    imagem VARCHAR(255)
);

CREATE TABLE pedidos (
    id serial  PRIMARY KEY,
    usuario_id INT,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'Pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

