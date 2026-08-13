const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho onde o arquivo do banco será salvo
const dbPath = path.resolve(__dirname, 'gamerverse.db');

// Cria ou abre a conexão com o banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados GamerVerse (SQLite).');
    }
});

// Inicialização das tabelas do banco de dados
db.serialize(() => {
    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de Pedidos/Compras (Opcional)
    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            total REAL NOT NULL,
            data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);
});

module.exports = db;