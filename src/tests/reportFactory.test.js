import { describe, assert } from 'poku';
import reportFactory from '../factories/reportFactory.js';

describe('Report Factory', () => {
    const categoria = 'Buraco na rua';

    const dados = {
        userId: 10,
        tipo: 'Infraestrutura',
        endereco: 'Rua A, 123',
        descricao: 'Existe um buraco grande na rua',
        latitude: -22.52,
        longitude: -44.10
    };

    const maxId = 5;

    const report = reportFactory.create(
        categoria,
        dados,
        maxId
    );

    assert.strictEqual(
        report.id,
        6
    );

    assert.strictEqual(
        report.userId,
        10
    );

    assert.strictEqual(
        report.categoria,
        'Buraco na rua'
    );

    assert.strictEqual(
        report.tipo,
        'Infraestrutura'
    );

    assert.strictEqual(
        report.endereco,
        'Rua A, 123'
    );

    assert.strictEqual(
        report.descricao,
        'Existe um buraco grande na rua'
    );

    assert.strictEqual(
        report.status,
        'pendente'
    );

    assert.strictEqual(
        report.latitude,
        -22.52
    );

    assert.strictEqual(
        report.longitude,
        -44.10
    );

    assert.ok(
        report.protocolo.startsWith('RC-6-')
    );

    assert.ok(
        report.criadoEm
    );
});

describe('Valores opcionais', () => {
    const dados = {
        userId: 10,
        endereco: 'Rua A, 123',
        descricao: 'Descrição do teste'
    };

    const report = reportFactory.create(
        'Buraco na rua',
        dados,
        5
    );

    assert.strictEqual(report.tipo, null);
    assert.strictEqual(report.latitude, null);
    assert.strictEqual(report.longitude, null);
});

describe('Dados obrigatórios', () => {
    const dados = {
        endereco: 'Rua A, 123',
        descricao: 'Descrição do teste'
    };

    const report = reportFactory.create(
        'Buraco na rua',
        dados,
        5
    );

    assert.strictEqual(
        report.userId,
        undefined
    );
});

describe('Protocolo', () => {
    const dados = {
        userId: 20,
        endereco: 'Rua B, 456',
        descricao: 'Novo relatório'
    };

    const maxId = 10;

    const report = reportFactory.create(
        'Iluminação',
        dados,
        maxId
    );

    assert.ok(
        report.protocolo.startsWith('RC-11-')
    );
});