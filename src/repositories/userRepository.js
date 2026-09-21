import crypto from 'crypto';
import { query } from '../database/conexao.js';
const SALT_LENGTH = 16;

// Helper: gera salt aleatório
function generateSalt() {
    return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

// Helper: hash scrypt com salt
function hashPassword(password, salt) {
    const hash = crypto.scryptSync(password, salt, 32);
    return `${salt}:${hash.toString('hex')}`;
}

// Helper: verifica senha
function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const testHash = crypto.scryptSync(password, salt, 32).toString('hex');
    return hash === testHash;
}

const userRepository = {

    async createUser(nome, email, senha, confirmationToken, confirmationExpiresAt) {
        const hashedPassword = hashPassword(senha, generateSalt());
        try {
            const { rows } = await query(`
                INSERT INTO users (nome, email, senha, status, "confirmationToken", "confirmationExpiresAt")
                VALUES ($1, $2, $3, 'pendente_confirmacao', $4, $5)
                RETURNING *
            `, [nome, email, hashedPassword, confirmationToken, confirmationExpiresAt]);
            return { newUser: rows[0], message: 'Cadastro realizado! Verifique seu email.' };
        } catch (error) {
            if (error.code === '23505') return { error: 'Este e-mail já está cadastrado' };
            throw error;
        }
    },

    async findByEmail(email) {
        const { rows } = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
        return rows[0] || null;
    },

    async findById(id) {
        const { rows } = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        return rows[0] || null;
    },

    async findByConfirmationToken(token) {
        const { rows } = await query('SELECT * FROM users WHERE "confirmationToken" = $1 LIMIT 1', [token]);
        return rows[0] || null;
    },

    async activateUser(token) {
        const { rows } = await query('SELECT * FROM users WHERE "confirmationToken" = $1 LIMIT 1', [token]);
        const user = rows[0];
        if (!user) return { error: 'Link inválido.' };
        if (user.status === 'ativo') return { error: 'Link já utilizado. Faça login normalmente.' };
        if (new Date(user.confirmationExpiresAt) < new Date()) return { error: 'Link expirado. Solicite um novo.' };
        const result = await query(`
            UPDATE users SET status = 'ativo', "confirmationToken" = NULL, "confirmationExpiresAt" = NULL
            WHERE id = $1 RETURNING *
        `, [user.id]);
        return { user: result.rows[0], message: 'Conta ativada com sucesso!' };
    },

    async updateUser(id, data) {
        try {
            const { rows } = await query(`
                UPDATE users SET nome = $1, cpf = $2, nascimento = $3, telefone = $4, email = $5
                WHERE id = $6 RETURNING *
            `, [data.nome, data.cpf, data.nascimento, data.telefone, data.email, id]);
            if (!rows[0]) return { error: 'Usuário não encontrado' };
            return { user: rows[0] };
        } catch (error) {
            if (error.code === '23505') return { error: 'Este e-mail já está cadastrado' };
            throw error;
        }
    },

    async listUsers() {
        const { rows } = await query('SELECT * FROM users ORDER BY id');
        return rows;
    }
};

export default userRepository;