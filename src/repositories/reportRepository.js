import fs from 'fs';

const DB_PATH = './src/database/reports.json';

const reportRepository = {
    createReport: (nome, cpf, nascimento, telefone, email, categoria, endereco, descricao) => {
        const reports = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const newReport = {
            id: reports.length + 1,
            nome,
            cpf,
            nascimento,
            telefone,
            email,
            categoria,
            endereco,
            descricao,
            status: 'pendente',
            criadoEm: new Date().toISOString()
        };
        reports.push(newReport);
        fs.writeFileSync(DB_PATH, JSON.stringify(reports, null, 2));
        return { newReport, message: 'Relato criado com sucesso!' };
    },

    listReports: () => {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
};

export default reportRepository;
