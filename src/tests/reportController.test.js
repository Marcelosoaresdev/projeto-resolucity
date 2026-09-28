import { describe, assert } from 'poku';
import reportController from '../controllers/reportController.js';
import reportRepository from '../repositories/reportRepository.js';

describe('Report Controller - createReport', async () => {
    const fakeResult = {
        newReport: {
            id: 1,
            categoria: 'Buraco',
            status: 'pendente'
        },
        message: 'Relato criado com sucesso!'
    };

    reportRepository.createReport = async () => fakeResult;

    const req = {
        session: { userId: 10 },
        body: {
            categoria: 'Buraco',
            tipo: 'Asfalto',
            endereco: 'Rua A',
            descricao: 'Buraco grande',
            latitude: null,
            longitude: null
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

    await reportController.createReport(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.deepStrictEqual(res.body, fakeResult);
});

describe('Report Controller - listReports', async () => {
    const fakeReports = [
        { id: 1, categoria: 'Buraco' },
        { id: 2, categoria: 'Iluminação' }
    ];

    const paginatedReports = {
        items: fakeReports,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    };

    reportRepository.listReports = async () => paginatedReports;

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    await reportController.listReports({ query: {} }, res);

    assert.deepStrictEqual(res.body, paginatedReports);
});

describe('Report Controller - listMyReports', async () => {
    const fakeReports = [
        { id: 1, userId: 10, categoria: 'Buraco' }
    ];

    const paginatedReports = {
        items: fakeReports,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    };

    reportRepository.listByUserId = async () => paginatedReports;

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    await reportController.listMyReports(
        { session: { userId: 10 }, query: {} },
        res
    );

    assert.deepStrictEqual(res.body, paginatedReports);
});

describe('Report Controller - getStats', async () => {
    const fakeStats = {
        total: 3,
        resolvidos: 1,
        pendentes: 1,
        emAndamento: 1
    };

    reportRepository.getStats = async () => fakeStats;

    const req = {
        query: {
            period: 'all',
            start: undefined,
            end: undefined
        }
    };

    const res = {
        body: null,
        json(data) {
            this.body = data;
        }
    };

    await reportController.getStats(req, res);

    assert.deepStrictEqual(res.body, fakeStats);
});

describe('Report Controller - updateReport', async () => {
    const fakeResult = {
        success: true,
        message: 'Relato atualizado com sucesso!'
    };

    reportRepository.updateReport = () => fakeResult;

    const req = {
        params: { id: '1' },
        session: { userId: 10 },
        body: {
            categoria: 'Buraco',
            tipo: 'Asfalto',
            endereco: 'Rua A',
            descricao: 'Atualizado',
            latitude: null,
            longitude: null,
            status: 'em_andamento'
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

    await reportController.updateReport(req, res);

    assert.strictEqual(res.statusCode, null);
    assert.deepStrictEqual(res.body, fakeResult);
});

describe('Report Controller - updateReport erro', async () => {
    reportRepository.updateReport = () => ({
        success: false,
        message: 'Relato não encontrado'
    });

    const req = {
        params: { id: '999' },
        session: { userId: 10 },
        body: {}
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

    await reportController.updateReport(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, {
        message: 'Relato não encontrado'
    });
});

describe('Report Controller - deleteReport', async () => {
    const fakeResult = {
        success: true,
        message: 'Relato excluído com sucesso!'
    };

    reportRepository.deleteReport = () => fakeResult;

    const req = {
        params: { id: '1' },
        session: { userId: 10 }
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

    await reportController.deleteReport(req, res);

    assert.strictEqual(res.statusCode, null);
    assert.deepStrictEqual(res.body, fakeResult);
});

describe('Report Controller - deleteReport erro', async () => {
    reportRepository.deleteReport = () => ({
        success: false,
        message: 'Relato não encontrado'
    });

    const req = {
        params: { id: '999' },
        session: { userId: 10 }
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

    await reportController.deleteReport(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, {
        message: 'Relato não encontrado'
    });
});