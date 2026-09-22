import { describe, assert } from 'poku';
import { createReportRepository } from '../repositories/reportRepository.js';

describe('Report Repository - listReports', async () => {
    const fakeReports = [
        {
            id: 1,
            userId: 10,
            categoria: 'Buraco',
            status: 'pendente'
        },
        {
            id: 2,
            userId: 20,
            categoria: 'Iluminação',
            status: 'resolvido'
        }
    ];

    const fakeQuery = async () => ({
        rows: fakeReports
    });

    const repository = createReportRepository(fakeQuery);

    const reports = await repository.listReports();

    assert.deepStrictEqual(reports, fakeReports);
});

describe('Report Repository - listByUserId', async () => {
    const fakeReports = [
        {
            id: 1,
            userId: 10,
            categoria: 'Buraco',
            status: 'pendente'
        },
        {
            id: 2,
            userId: 10,
            categoria: 'Iluminação',
            status: 'resolvido'
        }
    ];

    const fakeQuery = async () => ({
        rows: fakeReports
    });

    const repository = createReportRepository(fakeQuery);

    const reports = await repository.listByUserId(10);

    assert.deepStrictEqual(reports, fakeReports);
});

describe('Report Repository - createReport', async () => {
    const savedReport = {
        id: 1,
        userId: 10,
        categoria: 'Buraco',
        tipo: 'Asfalto',
        endereco: 'Rua A',
        descricao: 'Buraco grande',
        status: 'pendente'
    };

    const fakeQuery = async (sql) => {
        if (sql.startsWith('INSERT')) {
            return { rows: [savedReport] };
        }

        return {
            rows: [{
                ...savedReport,
                protocolo: 'RC-1-123456'
            }]
        };
    };

    const repository = createReportRepository(fakeQuery);

    const result = await repository.createReport(
        10,
        'Buraco',
        'Asfalto',
        'Rua A',
        'Buraco grande',
        null,
        null
    );

    assert.strictEqual(result.message, 'Relato criado com sucesso!');
    assert.strictEqual(result.newReport.id, 1);
    assert.strictEqual(result.newReport.userId, 10);
    assert.strictEqual(result.newReport.categoria, 'Buraco');
});

describe('Report Repository - getStats', async () => {
    const fakeReports = [
        {
            id: 1,
            categoria: 'Buraco',
            status: 'pendente',
            endereco: 'Rua A, Centro, Volta Redonda, Rio de Janeiro',
            criadoEm: new Date().toISOString()
        },
        {
            id: 2,
            categoria: 'Buraco',
            status: 'resolvido',
            endereco: 'Rua B, Centro, Volta Redonda, Rio de Janeiro',
            criadoEm: new Date().toISOString()
        },
        {
            id: 3,
            categoria: 'Iluminação',
            status: 'em_andamento',
            endereco: 'Rua C, Vila Santa Cecília, Volta Redonda, Rio de Janeiro',
            criadoEm: new Date().toISOString()
        }
    ];

    const fakeQuery = async () => ({
        rows: fakeReports
    });

    const repository = createReportRepository(fakeQuery);

    const stats = await repository.getStats('all');

    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.resolvidos, 1);
    assert.strictEqual(stats.pendentes, 1);
    assert.strictEqual(stats.emAndamento, 1);

    assert.deepStrictEqual(stats.porCategoria, {
        Buraco: 2,
        Iluminação: 1
    });

    assert.deepStrictEqual(stats.resolvidosPorCategoria, {
        Buraco: 1
    });
});

describe('Report Repository - getStats custom', async () => {
    const fakeReports = [
        {
            id: 1,
            categoria: 'Buraco',
            status: 'pendente',
            endereco: 'Rua A, Centro, Volta Redonda, Rio de Janeiro',
            criadoEm: '2026-01-10T12:00:00.000Z'
        },
        {
            id: 2,
            categoria: 'Iluminação',
            status: 'resolvido',
            endereco: 'Rua B, Centro, Volta Redonda, Rio de Janeiro',
            criadoEm: '2026-02-10T12:00:00.000Z'
        }
    ];

    const fakeQuery = async () => ({
        rows: fakeReports
    });

    const repository = createReportRepository(fakeQuery);

    const stats = await repository.getStats(
        'custom',
        '2026-02-01',
        '2026-02-28'
    );

    assert.strictEqual(stats.total, 1);
    assert.strictEqual(stats.resolvidos, 1);
    assert.strictEqual(stats.pendentes, 0);
});

describe('Report Repository - updateReport', async () => {
    const fakeReport = {
        id: 1,
        userId: 10,
        categoria: 'Buraco',
        descricao: 'Buraco atualizado',
        status: 'em_andamento'
    };

    const repository = createReportRepository();

    repository.updateReport = async () => fakeReport;

    const result = await repository.updateReport(
        1,
        10,
        {
            descricao: 'Buraco atualizado',
            status: 'em_andamento'
        }
    );

    assert.deepStrictEqual(result, fakeReport);
});

describe('Report Repository - deleteReport', async () => {
    const repository = createReportRepository();

    repository.deleteReport = async () => ({
        message: 'Relato excluído com sucesso!'
    });

    const result = await repository.deleteReport(1, 10);

    assert.deepStrictEqual(result, {
        message: 'Relato excluído com sucesso!'
    });
});

describe('Report Repository - updateReport not found', async () => {
    const repository = createReportRepository();

    repository.updateReport = async () => ({
        error: 'Relato não encontrado'
    });

    const result = await repository.updateReport(
        999,
        10,
        {
            descricao: 'Nova descrição'
        }
    );

    assert.deepStrictEqual(result, {
        error: 'Relato não encontrado'
    });
});

describe('Report Repository - deleteReport not found', async () => {
    const repository = createReportRepository();

    repository.deleteReport = async () => ({
        error: 'Relato não encontrado'
    });

    const result = await repository.deleteReport(999, 10);

    assert.deepStrictEqual(result, {
        error: 'Relato não encontrado'
    });
});