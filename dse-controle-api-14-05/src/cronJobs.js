const Comunicacao = require('./comunicacao/comunicacao');
const sqlUtils = require('./utils/sqlUtils');
const Utils = require('./utils/utils');
const CronJob = require('cron').CronJob;
const ProjetoDocumento = require("./projeto/projeto_documento/projeto_documento")
// notifica usuário e papel responsável pela tarefa além do gerente do projeto e colaboradores
exports.taskLate = new CronJob('0 0 * * * *', async () => {
    try {
        const now = new Date();
        const formattedDate = Utils.formatarDataParaMySQL(now);
        const steps = await sqlUtils.executeQuery(`SELECT * FROM processo_passo where status_id != 1 and estimativa < '${formattedDate}' order by id desc;`);
        for (const step of steps) {
            if (step.responsavel_id) {
                const task = await sqlUtils.executeQuery(`SELECT * FROM processo_passo_cadastro where id = ${step.processo_passo_cadastro_id}`);
                const responsible = await sqlUtils.executeQuery(`SELECT * FROM usuario where id = ${step.responsavel_id}`);
                const users = await Comunicacao.usersToNotificate(step.processo_id, step.papel_id);
                const ids = users.map((user) => user.id);
                await Comunicacao.push({ title: 'Tarefa atrasada', body: `A tarefa ${task[0].nome} de ${responsible[0].nome} se encontra ATRASADA.`, ids: ids });
            }
        }
    } catch (error) {
        console.error(error);
    }
}, null, false, 'America/Sao_Paulo');

exports.documentToExpire = new CronJob('0 8,14 * * *', async () => {
    try {
        ProjetoDocumento.notifyExpiringDocuments()
    } catch (error) {
        console.error(error);
    }
}, null, false, 'America/Sao_Paulo');