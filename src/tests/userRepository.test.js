import { describe, assert } from 'poku';
import { createUserRepository } from '../repositories/userRepository.js';

describe('User Repository - findByEmail', async () => {
    const fakeUser = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com'
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findByEmail('joao@email.com');

    assert.deepStrictEqual(user, fakeUser);
});

describe('User Repository - findByEmail usuário não encontrado', async () => {
    const fakeQuery = async () => ({
        rows: []
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findByEmail('naoexiste@email.com');

    assert.strictEqual(user, null);
});

describe('User Repository - findById', async () => {
    const fakeUser = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com'
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findById(1);

    assert.deepStrictEqual(user, fakeUser);
});

describe('User Repository - findById usuário não encontrado', async () => {
    const fakeQuery = async () => ({
        rows: []
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findById(999);

    assert.strictEqual(user, null);
});

describe('User Repository - findByConfirmationToken', async () => {
    const fakeUser = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
        confirmationToken: 'abc123'
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findByConfirmationToken('abc123');

    assert.deepStrictEqual(user, fakeUser);
});

describe('User Repository - findByConfirmationToken usuário não encontrado', async () => {
    const fakeQuery = async () => ({
        rows: []
    });

    const repository = createUserRepository(fakeQuery);

    const user = await repository.findByConfirmationToken('token-inexistente');

    assert.strictEqual(user, null);
});

describe('User Repository - activateUser', async () => {
    const fakeUser = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
        status: 'pendente_confirmacao',
        confirmationToken: 'abc123',
        confirmationExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };

    const activatedUser = {
        ...fakeUser,
        status: 'ativo',
        confirmationToken: null,
        confirmationExpiresAt: null
    };

    let call = 0;

    const fakeQuery = async () => {
        call++;

        if (call === 1) {
            return { rows: [fakeUser] };
        }

        return { rows: [activatedUser] };
    };

    const repository = createUserRepository(fakeQuery);

    const result = await repository.activateUser('abc123');

    assert.deepStrictEqual(result.user, activatedUser);
    assert.strictEqual(result.message, 'Conta ativada com sucesso!');
});

describe('User Repository - activateUser token inválido', async () => {
    const fakeQuery = async () => ({
        rows: []
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.activateUser('token-inexistente');

    assert.deepStrictEqual(result, {
        error: 'Link inválido.'
    });
});

describe('User Repository - activateUser token expirado', async () => {
    const fakeUser = {
        id: 1,
        status: 'pendente_confirmacao',
        confirmationExpiresAt: new Date(Date.now() - 60 * 60 * 1000)
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.activateUser('abc123');

    assert.deepStrictEqual(result, {
        error: 'Link expirado. Solicite um novo.'
    });
});

describe('User Repository - activateUser conta já ativa', async () => {
    const fakeUser = {
        id: 1,
        status: 'ativo',
        confirmationExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.activateUser('abc123');

    assert.deepStrictEqual(result, {
        error: 'Link já utilizado. Faça login normalmente.'
    });
});

describe('User Repository - updateUser', async () => {
    const updatedUser = {
        id: 1,
        nome: 'João Atualizado',
        cpf: '12345678900',
        nascimento: '1990-01-01',
        telefone: '999999999',
        email: 'joao@email.com'
    };

    const fakeQuery = async () => ({
        rows: [updatedUser]
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.updateUser(1, {
        nome: 'João Atualizado',
        cpf: '12345678900',
        nascimento: '1990-01-01',
        telefone: '999999999',
        email: 'joao@email.com'
    });

    assert.deepStrictEqual(result, {
        user: updatedUser
    });
});

describe('User Repository - updateUser usuário não encontrado', async () => {
    const fakeQuery = async () => ({
        rows: []
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.updateUser(999, {
        nome: 'João',
        cpf: '12345678900',
        nascimento: '1990-01-01',
        telefone: '999999999',
        email: 'joao@email.com'
    });

    assert.deepStrictEqual(result, {
        error: 'Usuário não encontrado'
    });
});

describe('User Repository - createUser', async () => {
    const fakeUser = {
        id: 1,
        nome: 'João',
        email: 'joao@email.com',
        status: 'pendente_confirmacao'
    };

    const fakeQuery = async () => ({
        rows: [fakeUser]
    });

    const repository = createUserRepository(fakeQuery);

    const result = await repository.createUser(
        'João',
        'joao@email.com',
        '123456',
        'abc123',
        new Date(Date.now() + 60 * 60 * 1000)
    );

    assert.deepStrictEqual(result.newUser, fakeUser);
    assert.strictEqual(
        result.message,
        'Cadastro realizado! Verifique seu email.'
    );
});

describe('User Repository - createUser e-mail já cadastrado', async () => {
    const fakeQuery = async () => {
        const error = new Error('E-mail duplicado');
        error.code = '23505';
        throw error;
    };

    const repository = createUserRepository(fakeQuery);

    const result = await repository.createUser(
        'João',
        'joao@email.com',
        '123456',
        'abc123',
        new Date(Date.now() + 60 * 60 * 1000)
    );

    assert.deepStrictEqual(result, {
        error: 'Este e-mail já está cadastrado'
    });
});