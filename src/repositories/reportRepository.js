import userRepository from './userRepository.js';
import reportFactory from '../factories/reportFactory.js';
import { query } from '../database/conexao.js';

const reportRepository = {
    async createReport(userId, categoria, tipo, endereco, descricao, latitude, longitude) {
        const reportData = reportFactory.create(categoria, {
            userId,
            tipo,
            endereco,
            descricao,
            latitude,
            longitude,
            categoria,
        }, null);
        const result = await query(`
            INSERT INTO reports ("userId", categoria, tipo, endereco, descricao, status, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [userId, reportData.categoria, reportData.tipo, reportData.endereco, reportData.descricao,
            reportData.status, reportData.latitude, reportData.longitude]);
        const savedReport = result.rows[0];
        const protocolo = `RC-${savedReport.id}-${Date.now()}`;
        const updated = await query('UPDATE reports SET protocolo = $1 WHERE id = $2 RETURNING *', [protocolo, savedReport.id]);
        const newReport = updated.rows[0];
        return { newReport, message: 'Relato criado com sucesso!' };
    },

    async listReports() {
        const { rows } = await query('SELECT * FROM reports ORDER BY id');
        return rows;
    },

    async listByUserId(userId) {
        const { rows } = await query(`
            SELECT r.*, u.nome, u.cpf, u.nascimento, u.telefone, u.email
            FROM reports r LEFT JOIN users u ON u.id = r."userId"
            WHERE r."userId" = $1 ORDER BY r.id
        `, [userId]);
        return rows;
    },

    async getStats(period, startDate, endDate) {
        const result = await query('SELECT * FROM reports ORDER BY id');
        let reports = result.rows;

        // Filtro por período
        if (period && period !== 'all') {
            const now = new Date();
            let start;

            if (period === '7d') {
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === '30d') {
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (period === 'ano') {
                start = new Date(now.getFullYear(), 0, 1); // 1 Jan do ano atual
            } else if (period === 'custom' && startDate && endDate) {
                start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                reports = reports.filter(r => {
                    const created = new Date(r.criadoEm);
                    return created >= start && created <= end;
                });
            }

            if (period !== 'custom') {
                start.setHours(0, 0, 0, 0);
                reports = reports.filter(r => new Date(r.criadoEm) >= start);
            }
        }

        // Totais
        const total = reports.length;
        const resolvidos = reports.filter(r => r.status === 'resolvido').length;
        const pendentes = reports.filter(r => r.status === 'pendente').length;
        const emAndamento = reports.filter(r => r.status === 'em_andamento').length;

        // Por categoria
        const porCategoria = {};
        reports.forEach(r => {
            porCategoria[r.categoria] = (porCategoria[r.categoria] || 0) + 1;
        });

        // Resolvidos por categoria
        const resolvidosPorCategoria = {};
        reports.filter(r => r.status === 'resolvido').forEach(r => {
            resolvidosPorCategoria[r.categoria] = (resolvidosPorCategoria[r.categoria] || 0) + 1;
        });

        // Por bairro (extraído do endereço)
        const porBairro = {};
        reports.forEach(r => {
            const bairro = extractBairro(r.endereco);
            porBairro[bairro] = (porBairro[bairro] || 0) + 1;
        });

        // Por mês (últimos 12 meses)
        const porMes = {};
        const resolvidosPorMes = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            porMes[key] = 0;
            resolvidosPorMes[key] = 0;
        }

        reports.forEach(r => {
            const created = new Date(r.criadoEm);
            const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
            if (porMes[key] !== undefined) {
                porMes[key]++;
            }
            if (r.status === 'resolvido' && resolvidosPorMes[key] !== undefined) {
                resolvidosPorMes[key]++;
            }
        });

        return {
            total,
            resolvidos,
            pendentes,
            emAndamento,
            porCategoria,
            resolvidosPorCategoria,
            porBairro,
            porMes,
            resolvidosPorMes
        };
    }
};

// Função auxiliar para extrair bairro do endereço
function extractBairro(endereco) {
    if (!endereco) return 'Outros';

    // Padrão 1: "Rua X, NUMERO - BAIRRO, Cidade - Estado"
    // Ex: "Rua das Flores, 123 - Centro, Volta Redonda - RJ"
    const match1 = endereco.match(/,\s*([^,]+?)\s*-\s*[^,]+$/);
    if (match1 && match1[1]) {
        const bairro = match1[1].trim();
        if (bairro.length < 30 && !bairro.match(/\d{5,}/)) {
            return bairro;
        }
    }

    // Padrão 2: "Rua X, NUMERO, BAIRRO, Cidade, Estado"
    // Ex: "Rua 23 A, Vila Santa Cecília, Volta Redonda, Rio de Janeiro"
    // Extrair o penúltimo segmento (antes da cidade)
    const parts = endereco.split(',').map(p => p.trim());
    if (parts.length >= 3) {
        // parts[0] = "Rua 23 A" (rua + numero)
        // parts[1] = "Vila Santa Cecília" (BAIRRO)
        // parts[2] = "Volta Redonda" (cidade)
        // parts[3] = "Rio de Janeiro" (estado)
        // Pegamos parts[1] que é o bairro
        const bairro = parts[1];
        if (bairro && bairro.length < 30 && !bairro.match(/\d{5,}/)) {
            return bairro;
        }
    }

    return 'Outros';
}

export default reportRepository;
