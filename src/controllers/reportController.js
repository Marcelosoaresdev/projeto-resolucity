import reportRepository from '../repositories/reportRepository.js';

const reportController = {
    async createReport(req, res) {
        const { categoria, tipo, endereco, descricao, latitude, longitude } = req.body;
        const userId = req.session.userId;

        // O controller não sabe como o relatório é construído — responsabilidade da Factory
        const result = await reportRepository.createReport(
            userId, categoria, tipo, endereco, descricao, latitude, longitude
        );

        res.status(201).json(result);
    },

    async listReports(req, res) {
        const reports = await reportRepository.listReports();
        res.json(reports);
    },

    async listMyReports(req, res) {
        const reports = await reportRepository.listByUserId(req.session.userId);
        res.json(reports);
    },

    async getStats(req, res) {
        const { period, start, end } = req.query;
        const stats = await reportRepository.getStats(period, start, end);
        res.json(stats);
    }
};

export default reportController;