import reportRepository from '../repositories/reportRepository.js';

const reportController = {
    createReport(req, res) {
        const { nome, cpf, nascimento, telefone, email, categoria, endereco, descricao } = req.body;
        const result = reportRepository.createReport(nome, cpf, nascimento, telefone, email, categoria, endereco, descricao);
        res.status(201).json(result);
    },

    listReports(req, res) {
        const reports = reportRepository.listReports();
        res.json(reports);
    }
};

export default reportController;
