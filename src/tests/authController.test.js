import { describe, assert } from 'poku';
import authController from '../controllers/authController.js';
import userRepository from '../repositories/userRepository.js';

describe('Auth Controller - validateName', () => {
    assert.strictEqual(
        authController.validateName('João da Silva'),
        null
    );
});

describe('Auth Controller - validateName error', () => {
    assert.strictEqual(
        authController.validateName('Jo'),
        'Nome deve ter pelo menos 3 caracteres'
    );
});

describe('Auth Controller - validateEmail', () => {
    assert.strictEqual(
        authController.validateEmail('teste@email.com'),
        null
    );

    assert.strictEqual(
        authController.validateEmail('email-invalido'),
        'Digite um e-mail válido'
    );
});

describe('Auth Controller - validateCpf', () => {
    assert.strictEqual(
        authController.validateCpf('529.982.247-25'),
        null
    );

    assert.strictEqual(
        authController.validateCpf('123'),
        'CPF deve ter 11 dígitos'
    );

    assert.strictEqual(
        authController.validateCpf('111.111.111-11'),
        'CPF inválido'
    );
});

describe('Auth Controller - validatePassword', () => {
    assert.strictEqual(
        authController.validatePassword('Senha123'),
        null
    );

    assert.strictEqual(
        authController.validatePassword('123'),
        'A senha deve ter 8+ caracteres, letra e número'
    );

    assert.strictEqual(
        authController.validatePassword('Senha123 '),
        'A senha não pode ter espaços'
    );
});

describe('Auth Controller - login', async () => {
    const createResponse = () => ({
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    });

    userRepository.findByEmail = async () => ({
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
        senha: '12345678',
        status: 'ativo'
    });

    const req = {
        body: {
            email: 'joao@email.com',
            senha: '12345678'
        },
        session: {}
    };

    const res = createResponse();

    await authController.login(req, res);

    assert.strictEqual(res.statusCode, null);
    assert.strictEqual(res.body.message, 'Login realizado com sucesso');
    assert.strictEqual(req.session.userId, 1);
});

describe('Auth Controller - login erros', async () => {
    const createResponse = () => ({
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    });

    userRepository.findByEmail = async () => null;

    const req = {
        body: {
            email: 'inexistente@email.com',
            senha: '12345678'
        },
        session: {}
    };

    const res = createResponse();

    await authController.login(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(
        res.body.message,
        'E-mail ou senha incorretos'
    );
});

describe('Auth Controller - login senha incorreta', async () => {
    const createResponse = () => ({
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    });

    userRepository.findByEmail = async () => ({
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
        senha: 'senha-correta',
        status: 'ativo'
    });

    const req = {
        body: {
            email: 'joao@email.com',
            senha: 'senha-errada'
        },
        session: {}
    };

    const res = createResponse();

    await authController.login(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(
        res.body.message,
        'E-mail ou senha incorretos'
    );
});

describe('Auth Controller - me', () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    };

    authController.me(
        { session: {} },
        res
    );

    assert.strictEqual(res.statusCode, 401);
    assert.deepStrictEqual(res.body, {
        message: 'Não autenticado'
    });
});

describe('Auth Controller - me autenticado', () => {
    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    authController.me(
        {
            session: {
                userId: 10,
                userName: 'João'
            }
        },
        res
    );

    assert.deepStrictEqual(res.body, {
        id: 10,
        nome: 'João'
    });
});

describe('Auth Controller - getProfile', async () => {
    userRepository.findById = async () => ({
        id: 10,
        nome: 'João',
        email: 'joao@email.com',
        cpf: '529.982.247-25',
        nascimento: '1990-01-01',
        telefone: '999999999'
    });

    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    };

    await authController.getProfile(
        { session: { userId: 10 } },
        res
    );

    assert.strictEqual(res.statusCode, null);
    assert.strictEqual(res.body.id, 10);
    assert.strictEqual(res.body.nome, 'João');
    assert.strictEqual(res.body.email, 'joao@email.com');
});

describe('Auth Controller - getProfile não autenticado', async () => {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    };

    await authController.getProfile(
        { session: {} },
        res
    );

    assert.strictEqual(res.statusCode, 401);
    assert.deepStrictEqual(res.body, {
        message: 'Não autenticado'
    });
});

describe('Auth Controller - updateProfile', async () => {
    userRepository.updateUser = async () => ({
        user: {
            id: 10,
            nome: 'Maria',
            email: 'maria@email.com'
        }
    });

    const req = {
        session: {
            userId: 10,
            userName: 'João'
        },
        body: {
            nome: 'Maria',
            cpf: '529.982.247-25',
            nascimento: '1990-01-01',
            telefone: '999999999',
            email: 'maria@email.com'
        }
    };

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    await authController.updateProfile(req, res);

    assert.strictEqual(res.body.message, 'Perfil atualizado');
    assert.strictEqual(req.session.userName, 'Maria');
});

describe('Auth Controller - listUsers', async () => {
    const fakeUsers = [
        {
            id: 1,
            nome: 'João',
            email: 'joao@email.com'
        },
        {
            id: 2,
            nome: 'Maria',
            email: 'maria@email.com'
        }
    ];

    userRepository.listUsers = async () => fakeUsers;

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    await authController.listUsers({}, res);

    assert.deepStrictEqual(res.body, fakeUsers);
});

describe('Auth Controller - logout', () => {
    let destroyed = false;

    const req = {
        session: {
            destroy(callback) {
                destroyed = true;
                callback();
            }
        }
    };

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    authController.logout(req, res);

    assert.strictEqual(destroyed, true);
    assert.deepStrictEqual(res.body, {
        message: 'Logout realizado'
    });
});

describe('Auth Controller - confirm', async () => {
    userRepository.activateUser = async () => ({});

    const req = {
        params: {
            token: 'token-valido'
        }
    };

    const res = {
        file: null,
        sendFile(file) {
            this.file = file;
        }
    };

    await authController.confirm(req, res);

    assert.ok(res.file.includes('email-confirmado.html'));
});

describe('Auth Controller - confirm token inválido', async () => {
    userRepository.activateUser = async () => ({
        error: 'Link inválido.'
    });

    const req = {
        params: {
            token: 'token-invalido'
        }
    };

    const res = {
        file: null,
        sendFile(file) {
            this.file = file;
        }
    };

    await authController.confirm(req, res);

    assert.ok(res.file.includes('email-confirmar-erro.html'));
});

describe('Auth Controller - register', async () => {
    userRepository.createUser = async () => ({
        newUser: {
            id: 10
        }
    });

    const req = {
        body: {
            nome: 'João da Silva',
            email: 'joao@email.com',
            senha: 'Senha123'
        }
    };

    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    };

    await authController.register(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(
        res.body.message,
        'Cadastro realizado! Verifique seu email.'
    );
    assert.strictEqual(res.body.userId, 10);
});

describe('Auth Controller - register campos obrigatórios', async () => {
    const req = {
        body: {
            nome: '',
            email: '',
            senha: ''
        }
    };

    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
        }
    };

    await authController.register(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
        res.body.message,
        'Preencha todos os campos'
    );
});