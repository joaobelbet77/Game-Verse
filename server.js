const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'gamerverse_chave_secreta_super_segura',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // Sessão expira em 1 hora
}));

// Conexão com o Banco de Dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabela de usuários se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    `);
});

// --- ROTAS DA API ---

// Rota para Cadastro de Usuário
app.post('/api/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Criptografa a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
        db.run(sql, [nome || 'Gamer', email, senhaHash], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
                }
                return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
            }
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// Rota para Login de Usuário
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Informe o e-mail e a senha.' });
    }

    const sql = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(sql, [email], async (err, usuario) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor.' });
        }

        if (!usuario) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // Compara a senha digitada com a criptografada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // Salva informações do usuário na sessão
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({ mensagem: 'Login realizado com sucesso!', usuario: req.session.usuario });
    });
});

// Rota para verificar sessão ativa
app.get('/api/me', (req, res) => {
    if (req.session.usuario) {
        res.json({ logado: true, usuario: req.session.usuario });
    } else {
        res.json({ logado: false });
    }
});

// Rota para Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ mensagem: 'Logout realizado com sucesso.' });
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor GamerVerse rodando em http://localhost:${PORT}`);
});
const nodemailer = require('nodemailer');

// 1. Configurar o Transportador de E-mail (Exemplo utilizando Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seu_email_gamerverse@gmail.com',  // Seu e-mail remetente
        pass: 'sua_senha_de_app_aqui'            // Senha de aplicativo (gerada na conta do Google)
    }
});

// 2. Rota para envio do e-mail de recuperação
app.post('/api/esqueceu-senha', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ erro: 'Por favor, informe seu e-mail.' });
    }

    // Consulta se o usuário realmente existe no Banco de Dados
    const sql = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(sql, [email], (err, usuario) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no banco de dados.' });
        }

        if (!usuario) {
            // Por segurança, retorna mensagem generosa sem expor se o e-mail existe
            return res.json({ mensagem: 'Se o e-mail estiver cadastrado, as instruções foram enviadas!' });
        }

        // Criar o link de redefinição de senha fictício/demo
        const linkRedefinicao = `http://localhost:3000/redefinir-senha.html?email=${encodeURIComponent(email)}`;

        // Estrutura do E-mail
        const mailOptions = {
            from: '"GamerVerse Support" <seu_email_gamerverse@gmail.com>',
            to: email,
            subject: '🎮 GamerVerse - Instruções para Recuperação de Senha',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #121214; color: #ffffff; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #ff4757;">Olá, ${usuario.nome}!</h2>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>GamerVerse</strong>.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    <p style="margin: 25px 0;">
                        <a href="${linkRedefinicao}" style="background-color: #ff4757; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Minha Senha</a>
                    </p>
                    <p style="color: #aaa; font-size: 0.85rem;">Se você não solicitou a alteração, ignore esta mensagem. Sua senha continuará a mesma.</p>
                </div>
            `
        };

        // Enviar o E-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error);
                return res.status(500).json({ erro: 'Ocorreu um erro ao tentar enviar o e-mail.' });
            }

            console.log('E-mail enviado:', info.response);
            res.json({ mensagem: 'Instruções enviadas com sucesso para o e-mail informado!' });
        });
    });
});