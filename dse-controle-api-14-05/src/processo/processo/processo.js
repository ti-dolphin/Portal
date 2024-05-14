const con = require('../../../data_base');
const sqlUtils = require("../../utils/sqlUtils.js");
const processoPassoCadastro = require('../processo_passo_cadastro/processo_passo_cadastro')
const FirebaseNotification = require('../../../firebase-notification')
const GoogleCloudStorage = require('../../../google-cloud-storage')
// const processoFluxoCadastro = require("../processo_fluxo_cadastro/processo_fluxo_cadastro")
const processoPasso = require("../processo_passo/processo_passo")
const utils = require("../../utils/utils.js")

const MomentFunctions = require('../../../momentFunctions')
const moment = require('moment')

class Processo {

    /**
     * @param {string[]} fields[] campos a serem consultados
     * @param {object[]} target[] array de obejetos que conte nome do campo (name) e valor a ser consultado(value)
     * @returns {Promise}  que vai resolver em rows e fields   
     **/

    static getProcessoExecucao(data){
        
        return new Promise(function (resolve, reject) {
            try {
                var aux=' ';
                if(data.usuario_id && data.usuario_id != ''){
                    aux = ` , (select 1 from processo_observadores where usuario_id = `+data.usuario_id+` and processo_id = p.id and area = 'Execução' limit 1) as acompanhando `;
                }
                const sql = `select p.id, p.usuario_id as responsavel_id, p.processo_cadastro_id, pc.nome, p.descricao, p.projeto_id, prc.nome as projeto, p.prazo, p.data_inicio, p.data_fim, p.condition_error, p.data_modificacao`+aux+`from processo p
                join processo_cadastro pc on p.processo_cadastro_id = pc.id
                join projeto_cadastro prc on p.projeto_id = prc.id
                where p.id = `+data.processo_id
                
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        if(rows.length > 0){
                            // rows[0].descricao = await Processo.geraTituloProcesso(rows[0].id)
                            resolve(rows[0]);
                        } else{
                            resolve(false);
                        }
                    }
                });
                
            } catch (error) {
                console.log("Erro getProcessoExecucao arquivo processo.js: "+error)
                reject(error)
            }

        });
    }

    static selectProcessosAbaProcessos(data){
        return new Promise(async function (resolve, reject) {
            try {
                if(data.isAdm){
                    var processos = await Processo.getProcessosAbaAdm(data)
                } else{
                    var processos = await Processo.getProcessosAbaAdmUsuarioGeral(data.usuario_id)
                }
                resolve(processos)
            } catch (error) {
                reject(error)
            }

        });
    }

    static getProcessosAbaUser(usuario_id, papeis){
        var sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,  p.data_fim, p.data_inicio,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        pp.estimativa as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (SELECT CONCAT(caminho_padrao, '/', (
            SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
        )) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id
        where p.data_fim IS NULL and ((pp.responsavel_id is null and pp.papel_id IN ('`+papeis+`')) OR (pp.responsavel_id = `+usuario_id+`))
        group by p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, responsavel, andamento, data_fim, data_inicio`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.avatar = ''
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getProcessosAbaAdmUsuarioGeral(usuario_id){
        return new Promise(async function (resolve, reject) {
            try {
                const usuarioPapel = await Processo.getPapeisUser(usuario_id); // obetem os papeis do usuário
                const processosUser = await Processo.getProcessosUsuarioeObservados(usuario_id, false) // processos que o usuário iniciou e é observador
                const processos = await Processo.getProcessosUsuarioeObservados(usuario_id, true) // todos os processos exceto os que o usuário iniciou e é observador
                
                const map = processos.map(async (p) => {
                    const papeisProcesso = await Processo.getPapeisProcesso(p.pid)
                    const isInArray = papeisProcesso.some(el => usuarioPapel.includes(el)) // verifica se o processo contem alguma tarefa de algum papel do usuário
                    if(isInArray){
                        // p.titulo = await Processo.geraTituloProcesso(p.pid)
                        processosUser.push(p)
                    }
                })

                await Promise.all(map)
                resolve(processosUser)
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static getProcessosUsuarioeObservados(usuario_id, not){

        const negar = not ? "not " : ""

        const sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,  p.data_fim, p.data_inicio,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        ("https://storage.googleapis.com/dolphin-bucket/projetos/249/Fundo%20Cinza_Nome%20Azul%20Laranja%20-%20Copia.png?GoogleAccessId=adm-bucket-dolphin%40roxcode.iam.gserviceaccount.com&Expires=4108244400&Signature=BAmoBA2FLnJ0hon5VJA%2FW9daWWdlSqoHXODrdxFXUMbjCrMk3pET5ZuA7EeuCon6Q1jOakwwgFNe6w560OkrCfXsmi2dZFZvYg0MAjRjTNLC%2Ft8xTA3zKFYV05Meae8DC1EOv0zl9A7BufYoGdvCDC7QZ%2FS3zYYXnMya4FDVYJovOhaKb0Ckua8s%2BDEmbHJ3WRrEHQs5yZnh6lN%2FXwYIMhLQPuAuoH9bbosrPQtqV82Hy9dICwSHon%2BnI1P0pAMOAI78%2FwQa432zDcqSuNys7s7BegXcw8QlLGSwtiTHHctg%2BJJVSHTOR3YDWeZQ1Yt8OCBXKZ%2BvmkIeVY5KBJXVcw%3D%3D") as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        pp.estimativa as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (SELECT CONCAT(caminho_padrao, '/', (
            SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
        )) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento,
        (SELECT nome from papel where id = pp.papel_id) as papel,
        (select nome from papel where id = pr.papel_id) as papelOriginal
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id  
        where p.id `+negar+` in (select id from processo 
        where usuario_id = `+usuario_id+` or 
        id IN(select p.id from processo p join processo_observadores p_obs on p.id = p_obs.processo_id and p_obs.usuario_id = `+usuario_id+`)
        group by id)
        group by p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, responsavel, andamento, data_fim, data_inicio, papel, papelOriginal`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });   
    }

    static getPapeisProcesso(processo_id){
        const sql = `select papel_id from processo_passo where processo_id = `+processo_id+` group by papel_id`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {                    
                    var arr = []
                    rows.map((r) => {
                        arr.push(r.papel_id)
                    })
                    resolve(arr);
                }
            });
        }); 
    }

    static getProcessosAbaAdm(data){
        var sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,  p.data_fim, p.data_inicio,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        ("https://storage.googleapis.com/dolphin-bucket/projetos/249/Fundo%20Cinza_Nome%20Azul%20Laranja%20-%20Copia.png?GoogleAccessId=adm-bucket-dolphin%40roxcode.iam.gserviceaccount.com&Expires=4108244400&Signature=BAmoBA2FLnJ0hon5VJA%2FW9daWWdlSqoHXODrdxFXUMbjCrMk3pET5ZuA7EeuCon6Q1jOakwwgFNe6w560OkrCfXsmi2dZFZvYg0MAjRjTNLC%2Ft8xTA3zKFYV05Meae8DC1EOv0zl9A7BufYoGdvCDC7QZ%2FS3zYYXnMya4FDVYJovOhaKb0Ckua8s%2BDEmbHJ3WRrEHQs5yZnh6lN%2FXwYIMhLQPuAuoH9bbosrPQtqV82Hy9dICwSHon%2BnI1P0pAMOAI78%2FwQa432zDcqSuNys7s7BegXcw8QlLGSwtiTHHctg%2BJJVSHTOR3YDWeZQ1Yt8OCBXKZ%2BvmkIeVY5KBJXVcw%3D%3D") as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        pp.estimativa as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (SELECT CONCAT(caminho_padrao, '/', (
            SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
        )) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento,
        (SELECT nome from papel where id = pp.papel_id) as papel,
        (select nome from papel where id = pr.papel_id) as papelOriginal
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id  group by p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, responsavel, andamento, data_fim, data_inicio, papel, papelOriginal`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    // const map = rows.map(async (p) => { // consulta as imagens dos projetos
                    //     p.titulo = await Processo.geraTituloProcesso(p.pid)
                    //     // var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                    //     // if(await GoogleCloudStorage.verificaArquivo(caminho)){
                    //     //     p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                    //     // } else{
                    //     //     p.avatar = ''
                    //     // }
                    // })

                    // await Promise.all(map)

                    resolve(rows, fields);
                }
            });
        });
    }

    static verificaProcessos(){
        return new Promise(async function (resolve, reject) {
            try {
                const processosTravados = await Processo.getProcessosTravados()
                const retorno = []
    
                for (const p of processosTravados) {
                    retorno.push(p.id)
                    await processoPasso.update({
                        id: p.processo_passo_id,
                        status_id: 5,
                        condition_error: 0
                    })
                }
    
                resolve(retorno)
                
            } catch (error) {
                reject(error)
            }
        })
    }

    static getProcessosTravados(){
        const sql = `select p.* from processo p 
        join processo_passo pp on p.processo_passo_id = pp.id
        where p.data_fim is null and pp.status_id = 1;`
        
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static selectProcessosHome(usuario_id){
        return new Promise(async function (resolve, reject) {
            var papeis = await Processo.getPapeisUser(usuario_id)
            
            var todos = await Processo.getProcessosAfazer(usuario_id, papeis)
            var aFazer = todos.filter((element) => element.status_tarefa === 5 || element.status_tarefa === 4) // status_id 5 Não iniciado
            var fazendo = todos.filter((element) => element.status_tarefa === 2) // status_id 2 Fazendo
            var aguardando = todos.filter((element) => element.status_tarefa === 3) // status_id 3 Aguardando
            // var naoConcluido = todos.filter((element) => element.status_tarefa === 4) // status_id 4 Não Concluído
            var atrasados = await Processo.getProcessosAtrasados(usuario_id, papeis)
            var acompanhando = await Processo.getProcessosAcompanhando(usuario_id)
            var iniciadosUser = await Processo.getProcessosIniciadosUser(usuario_id)

            var retorno = [
                {
                    value: '1',
                    label: 'A fazer',
                    data: aFazer
                },
                {
                    value: '2',
                    label: 'Fazendo',
                    data: fazendo
                },
                {
                    value: '3',
                    label: 'Aguardando',
                    data: aguardando
                },
                // {
                //     value: '4',
                //     label: 'Não concluído',
                //     data: naoConcluido
                // },
                {
                    value: '4',
                    label: 'Atrasados',
                    data: atrasados
                },
                {
                    value: '5',
                    label: 'Acompanhando',
                    data: acompanhando
                },
                {
                    value: '6',
                    label: 'Iniciados por mim',
                    data: iniciadosUser
                }
            ]

            resolve(retorno)

        });
    }

    static setaTituloProcesso(data){
        return new Promise(async function (resolve, reject) {
            try {
                const titulo = await Processo.geraTituloProcesso(data.id)
                await Processo.simpleUpdate({
                    id: data.id,
                    descricao: titulo
                })
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }

    static geraTituloProcesso(processo_id){

        return new Promise(async function (resolve, reject) {

            try {
                const processo = await Processo.getProcesso(processo_id)
                const titulo = await Processo.selectTituloProcesso(processo.processo_cadastro_id)
    
                var tituloProcesso = processo.descricao
    
                for (const t of titulo) {
                    const passo = await Processo.getPassoTitulo(processo_id, t.processo_passo_cadastro_id)
                    if(passo){
                        const campo = await Processo.getCampoTitulo(passo.id, t.processo_campo_cadastro_id)
        
                        if(campo){
                            if(!tituloProcesso.includes(campo.valor)){
                                if(campo.tipo === 'Data'){
                                    if(!tituloProcesso.includes(moment(campo.valor).format('DD/MM/YYYY'))) {
                                        tituloProcesso += " "+moment(campo.valor).format('DD/MM/YYYY')
                                    }
                                }else{
                                    tituloProcesso += " "+campo.valor
                                }
                            }
                        }
                    }
                    
                }
                resolve(tituloProcesso)
            } catch (error) {
                reject(error)
            }

        })
    }

    static getPassoTitulo(processo_id, processo_passo_cadastro_id){
        const sql = "SELECT * FROM processo_passo where processo_id = "+processo_id+" and processo_passo_cadastro_id = "+processo_passo_cadastro_id+" order by id desc limit 1"
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static getCampoTitulo(processo_passo_id, processo_campo_cadastro_id){
        const sql = "SELECT pc.*, pcc.tipo FROM processo_campos pc inner join processo_campo_cadastro pcc on pc.processo_campo_cadastro_id = pcc.id where pc.processo_passo_id = "+processo_passo_id+" and pc.processo_campo_cadastro_id = "+processo_campo_cadastro_id+" order by id desc limit 1"
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static selectTituloProcesso(processo_id){
        const sql = "SELECT * FROM processo_titulo where processo_cadastro_id ="+processo_id;
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static getPapeisUser(usuario_id){
        const sql = "SELECT * FROM usuario_papel where usuario_id = "+usuario_id
        //console.log("sql gerado:", sql)
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    var arr = []
                    rows.map((r) => {
                        arr.push(r.papel_id)
                    })
                    resolve(arr);
                }
            });
        });
    }

    static getProcessosIniciadosUser(usuario_id){
        const sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        pp.estimativa as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (select (select status from processo_passo_status where id = status_id) as status from processo_passo where processo_id = p.id and processo_passo_cadastro_id = pr.id limit 1) as status,
        (select 1 from processo_observadores where usuario_id = `+usuario_id+` and processo_id = p.id and area = 'Execução' order by id desc limit 1) as acompanhando,

        (SELECT CONCAT(caminho_padrao, '/', (
			SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
		)) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento

        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id
        where p.data_fim IS NULL and p.usuario_id = `+usuario_id+`
        group by p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, acompanhando, andamento, responsavel, status`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        // p.titulo = await Processo.geraTituloProcesso(p.pid)
                        var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.avatar = ''
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });    
    }

    static getProcessosAfazer(usuario_id, papeis){

        let where
        if(papeis && papeis.length > 0){
            where = `((pp.responsavel_id is null and pp.papel_id IN (`+papeis+`)) OR (pp.responsavel_id = `+usuario_id+`))`
        } else{
            where = `pp.responsavel_id = `+usuario_id+` `
        }
        
        const sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,
        (select nome from projeto_cadastro where id = p.projeto_id order by id desc limit 1) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id order by id desc limit 1) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id order by id desc limit 1) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual, p.processo_cadastro_id,
        pp.estimativa as prazo_tarefa, pp.status_id as status_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (select (select status from processo_passo_status where id = status_id) as status from processo_passo where processo_id = p.id and processo_passo_cadastro_id = pr.id limit 1) as status,
        (select 1 from processo_observadores where usuario_id = `+usuario_id+` and processo_id = p.id and area = 'Execução' order by id desc limit 1) as acompanhando,

        (SELECT CONCAT(caminho_padrao, '/', (
			SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id order by id desc limit 1
		)) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id order by id desc limit 1) as andamento

        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id
        where p.data_fim IS NULL and `+where+`
        group by p.processo_cadastro_id, p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, acompanhando, andamento, status_tarefa, status, responsavel`
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        // p.titulo = await Processo.geraTituloProcesso(p.pid)
                        var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.avatar = ''
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getProcessosAtrasados(usuario_id, papeis){

        let where
        if(papeis && papeis.length > 0){
            where = `((pp.responsavel_id is null and pp.papel_id IN (`+papeis+`)) OR (pp.responsavel_id = `+usuario_id+`))`
        } else{
            where = `pp.responsavel_id = `+usuario_id+` `
        }

        const sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        pp.estimativa as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (select (select status from processo_passo_status where id = status_id) as status from processo_passo where processo_id = p.id and processo_passo_cadastro_id = pr.id limit 1) as status,
        (select 1 from processo_observadores where usuario_id = `+usuario_id+` and processo_id = p.id and area = 'Execução' order by id desc limit 1) as acompanhando,

        (SELECT CONCAT(caminho_padrao, '/', (
			SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
		)) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_passo pp on p.processo_passo_id = pp.id
        where p.data_fim IS NULL and `+where+`
        and (p.prazo < NOW() OR pp.estimativa < NOW())
        group by p.id, p.prazo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa, acompanhando, andamento, responsavel, status`

        return new Promise(function (resolve, reject) {

            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
    
                        const map = rows.map(async (p) => { // consulta as imagens dos projetos
                            // p.titulo = await Processo.geraTituloProcesso(p.pid)
                            var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                            if(await GoogleCloudStorage.verificaArquivo(caminho)){
                                p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                            } else{
                                p.avatar = ''
                            }
                        })
    
                        await Promise.all(map)
                        resolve(rows, fields);
                    }
                });
                
            } catch (error) {
                reject(error)
            }
            // Do async job
        });
    }

    static getProcessosSemResponsavel(usuario_id, papeis){
        
        return new Promise(function (resolve, reject) {
            const sql = `select p.id as pid, p.prazo as prazo_processo, p.projeto_id,
            (select nome from projeto_cadastro where id = p.projeto_id) as title, 
            (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
            (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
            p.descricao as titulo, pr.nome as tarefa_atual,
            (select estimativa from processo_passo where processo_id = p.id and processo_passo_cadastro_id = p.processo_passo_cadastro_id) as prazo_tarefa,
            (select 1 from processo_observadores where usuario_id = `+usuario_id+` and processo_id = p.id and area = 'Execução') as acompanhando,

            (SELECT CONCAT(caminho_padrao, '/', (
                SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
            )) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento

            FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
            where p.data_fim IS NULL and pr.papel_id IN (`+papeis+`)`

            if(papeis.length > 0){
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
    
                        const map = rows.map(async (p) => { // consulta as imagens dos projetos
                            var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                            if(await GoogleCloudStorage.verificaArquivo(caminho)){
                                p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                            } else{
                                p.avatar = ''
                            }
                        })
    
                        await Promise.all(map)
                        resolve(rows, fields);
                    }
                });
            } else{
                resolve([])
            }
        });
    }

    static getProcessosAcompanhando(usuario_id){

        const sql = `select p.id as pid,p.prazo as prazo_processo, p.projeto_id,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        (select estimativa from processo_passo where processo_id = p.id and processo_passo_cadastro_id = p.processo_passo_cadastro_id limit 1) as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (select (select status from processo_passo_status where id = status_id) as status from processo_passo where processo_id = p.id and processo_passo_cadastro_id = pr.id limit 1) as status,
        (select 1 from processo_observadores where usuario_id = `+usuario_id+` and processo_id = p.id and area = 'Execução' order by id desc limit 1) as acompanhando,

        (SELECT CONCAT(caminho_padrao, '/', (
			SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
		)) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento

        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_observadores p_obs on p.id = p_obs.processo_id and p_obs.usuario_id = `+usuario_id+`
        where p.data_fim IS NULL
        group by pid, prazo_processo, p.projeto_id, title, avatar, processo, titulo, tarefa_atual, prazo_tarefa,
        responsavel, status, acompanhando, andamento`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        // p.titulo = await Processo.geraTituloProcesso(p.pid)
                        var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.avatar = ''
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getProcessosFavoritos(usuario_id){
        const sql = `select p.id as pid, p.projeto_id,
        (select nome from projeto_cadastro where id = p.projeto_id) as title, 
        (select imagem from projeto_cadastro where id = p.projeto_id) as avatar, 
        (select nome from processo_cadastro where id = p.processo_cadastro_id) as processo, 
        p.descricao as titulo, pr.nome as tarefa_atual,
        (select estimativa from processo_passo where processo_id = p.id and processo_passo_cadastro_id = p.processo_passo_cadastro_id) as prazo_tarefa,
        (select nome from usuario where id = p.usuario_id) as responsavel,
        (select status from processo_passo where processo_id = p.id and processo_passo_cadastro_id = pr.id) as status,
        (select 1 from processo_favoritos where usuario_id = `+usuario_id+` and processo_id = p.id) as favorite
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_favoritos p_favo on p.id = p_favo.processo_id and p_favo.usuario_id = `+usuario_id+`
        where p.data_fim IS NULL`

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (p) => { // consulta as imagens dos projetos
                        // p.titulo = await Processo.geraTituloProcesso(p.pid)
                        var caminho = 'projetos/'+p.projeto_id+'/'+p.avatar
                        if(await GoogleCloudStorage.verificaArquivo(caminho)){
                            p.avatar = await GoogleCloudStorage.getURLArquivo(caminho)
                        } else{
                            p.avatar = ''
                        }
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static getProcessosGed(data){
        // data = {
        //     usuario_id: 18,
        //     projeto_id: 51,
        //     categoria_id : 7 
        // }

        const sql = `select p.id as pid,p.prazo as prazo_processo, p_cad.nome as processo, p.descricao as titulo, pr.nome as tarefa_atual,
        (select estimativa from processo_passo where processo_id = p.id and processo_passo_cadastro_id = p.processo_passo_cadastro_id limit 1) as prazo_tarefa,
        (select 1 from processo_observadores where usuario_id = `+data.usuario_id+` and processo_id = p.id and area = 'Execução' limit 1) as acompanhando,
    
        (SELECT CONCAT(caminho_padrao, '/', (
            SELECT max(caminho_padrao) as max FROM processo_passo_cadastro where processo_cadastro_id = p.processo_cadastro_id
        )) FROM processo_passo_cadastro where id = p.processo_passo_cadastro_id and processo_cadastro_id = p.processo_cadastro_id) as andamento
    
        FROM processo p join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        join processo_cadastro p_cad on p.processo_cadastro_id = p_cad.id
        where p.data_fim IS NULL and p.projeto_id = `+data.projeto_id+` and p_cad.categoria_id = `+data.categoria_id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, async function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {

                    const map = rows.map(async (r) => {
                        // r.titulo = await Processo.geraTituloProcesso(r.pid)
                    })

                    await Promise.all(map)
                    resolve(rows, fields);
                }
            });
        });
    }

    static select(fields = null, targets = null) {
        const sql = sqlUtils.generate_select_query(targets, fields, "processo");
        //console.log("sql gerado:", sql)
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static selectPendentes(data){

        var where = ''
        // var sql = `select p.id as processo_id, proc.id as processo_cadastro_id, proc.nome as processo_nome,
        // pr.id as processo_passo_cadastro_id, pr.nome as processo_passo_cadastro_nome,
        // pro.id as projeto_cadastro_id, pro.nome as projeto_cadastro_nome,
        // (SELECT c.valor FROM processo ps
        //     join processo_passo pp on ps.id = pp.processo_id
        //     join processo_campos c on c.processo_passo_id = pp.id
        //     where ps.id = p.id and c.processo_campo_cadastro_id = 
        //     (SELECT c.id FROM processo_cadastro p
        //     join processo_passo_cadastro pp on p.id = pp.processo_cadastro_id
        //     join processo_campo_cadastro c on c.processo_passo_cadastro_id = pp.id
        //     where pp.estagio = 'inicial' and p.id = proc.id and c.nome = 'Descrição')) as descricao
        // FROM processo p 
        // join processo_cadastro proc on p.processo_cadastro_id = proc.id
        // join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        // join projeto_cadastro pro on p.projeto_id = pro.id where `

        var sql = `select p.*,pcad.nome as nome_processo, u.nome as solicitante, pro.nome as projeto_nome, pr.nome as processo_passo_cadastro_nome from processo p 
        join usuario u on p.usuario_id = u.id
        join projeto_cadastro pro on p.projeto_id = pro.id
        join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id 
        join processo_cadastro pcad on p.processo_cadastro_id = pcad.id
        where pr.estagio != 'final' and `

        if(data.papeis[0]){
            where = `pr.papel_id IN (`+data.papeis+`) OR (pr.papel_id = 0 and p.usuario_id = `+data.usuario_id+`)`
        } else{
            where = `(pr.papel_id = 0 || pr.papel_id = 6) and p.usuario_id = `+data.usuario_id+``
        }

        sql = sql+where

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });

    }

    static selectMostruario(data){
        var where = ''
        var sql = `select proc.nome, count(proc.id) as qtd
        FROM processo p 
        join processo_cadastro proc on p.processo_cadastro_id = proc.id
        join processo_passo_cadastro pr on p.processo_passo_cadastro_id = pr.id
        where pr.estagio != 'final' and `

        if(data.papeis[0]){
            where = `pr.papel_id IN (`+data.papeis+`) OR (pr.papel_id = 0 and p.usuario_id = `+data.usuario_id+`) 
            group by proc.nome`
        } else{
            where = `(pr.papel_id = 0 || pr.papel_id = 6) and p.usuario_id = `+data.usuario_id+`
            group by proc.nome`
        }

        sql = sql+where

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });

    }

    static getProcessoCompleto(id){
        return new Promise(async function (resolve, reject) {
            var processo = await Processo.getProcesso(id);
            processo.processo_cadastro = await Processo.getProcessoCadastro(processo.processo_cadastro_id)
            processo.passo_cadastro = (await processoPassoCadastro.getPassosComCampos(processo.processo_cadastro_id)).reverse()
            processo.solicitante = await Processo.getSolicitanteProcesso(processo.usuario_id)
            processo.projeto = await Processo.getProjetoProcesso(processo.projeto_id)
            processo.preenchidos = await processoPassoCadastro.getPassosPreenchidos(processo.id)
            processo.processo_passo_cadastro_id = await Processo.testaPassoAtual(processo.id,processo.processo_passo_cadastro_id)
            resolve(processo)
        })
    }

    static getProcesso(id){
        const sql = "select * from processo where id = "+id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false);
                    }
                }
            });

        });
    }

    static testaPassoAtual(processoId, processoPassoCadastroId){
        
        return new Promise(async function (resolve, reject) {
            if(await Processo.testaPassoFinal(processoPassoCadastroId)){
                if(await Processo.getProcessoPasso(processoId, processoPassoCadastroId)){
                    resolve(false)
                }else{
                    resolve(processoPassoCadastroId)
                }
            } else{
                resolve(processoPassoCadastroId)
            }
        });
    }

    static testaPassoFinal(processoPassoCadastroId){
        const sql = `select IF(estagio = 'final',true,false) as teste from processo_passo_cadastro where id = `+processoPassoCadastroId
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        if(rows[0].teste || rows[0].teste == 1){
                            resolve(true)
                        }else{
                            resolve(false)
                        }
                    } else{
                        resolve(false)
                    }
                }
            });

        });
    }

    static getProcessoPasso(processoId, processoPassoCadastroId){
        const sql = "SELECT * FROM processo_passo where processo_id = "+processoId+" and processo_passo_cadastro_id = "+processoPassoCadastroId
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows);
                    } else{
                        resolve(false);
                    }
                }
            });

        });
    }

    static getProcessoCadastro(id){
        const sql = "select * from processo_cadastro where id = "+id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false);
                    }
                }
            });

        });
    }

    static getSolicitanteProcesso(id){
        const sql = "select * from usuario where id = "+id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false);
                    }
                }
            });

        });
    }

    static getProjetoProcesso(id){
        const sql = "select * from projeto_cadastro where id = "+id
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0]);
                    } else{
                        resolve(false);
                    }
                }
            });

        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static insert(data) {
        const sql = sqlUtils.generate_insert_query(data, "processo");
        //console.log("sql gerado:", sql)
        
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static filtro(filtro) {
        console.log(filtro)
        var where = ''

        filtro.filtros.map((f) => {
            if(f.nome != 'usuario_nome'){
                where += ' and '+f.nome+' = "'+f.valor+'"'
            } else{
                where += ' and (select nome from usuario where id = p.usuario_id) like "'+f.valor+'"'
            }
        })

        const sql = 'SELECT distinct p.* FROM processo p join processo_passo pa on p.id = pa.processo_id where pa.usuario_id = '+filtro.usuario_id+' '+where+' '

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    static consultaDescricaoProcesso(data){
        const sql = `SELECT campo.valor FROM processo p 
        join processo_passo passo on p.id = passo.processo_id
        join processo_campos campo on campo.processo_passo_id = passo.id
        join processo_campo_cadastro campoCadastro on campo.processo_campo_cadastro_id = campoCadastro.id
        where campoCadastro.nome='Descrição' and p.id =`+ data.processo_id

        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });

        });
    }

    /**
     * 
     * @param {object} data contem os pares de campo e valor 
     * @returns {Promise}  que vai resolver em rows e fields
     */
    static update(data) {
        const sql = sqlUtils.generate_update_query(data, "processo");
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        // await Processo.notificaAtualizacaoProcesso(data.id)
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    static simpleUpdate(data) {
        const sql = sqlUtils.generate_update_query(data, "processo");
        return new Promise(function (resolve, reject) {
            try {
                con.query(sql, async function (err, rows, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows, fields);
                    }
                });
            } catch (error) {
                reject(error)   
            }
        });
    }


    static notificaAtualizacaoProcesso(processo_id){
        return new Promise(async function (resolve, reject) {
            const processo = await Processo.getProcesso(processo_id)
            const processoCadastro = await Processo.getProcessoCadastro(processo.processo_cadastro_id)
            const processoPassocadastro = await Processo.getProcessoPassocadastro(processo.processo_passo_cadastro_id)
            if(processoPassocadastro){
                if(processoPassocadastro.papel_id == 0){
                    await FirebaseNotification.push( // envia notificação para o responsavel
                        'Atualização no processo '+processoCadastro.nome,
                        'A etapa atual do processo '+processoCadastro.nome+' está aguardando preenchimento',
                        '/topics/user_'+processo.usuario_id
                    ) 
                    resolve()
                } else{
                    var usuarios = await Processo.getUsuarioPapel(processoPassocadastro.papel_id)
                    const map = usuarios.map(async (u) => {
                        await FirebaseNotification.push( // envia notificação para os usuarios do papel
                            'Atualização no processo '+processoCadastro.nome,
                            'A etapa atual do processo '+processoCadastro.nome+' está aguardando preenchimento',
                            '/topics/user_'+u.usuario_id) 
                    })
                    await Promise.all(map)
                    resolve()
                }
            }else{
                resolve()
            }
        })
    }

    static getProcessoPassocadastro(id){
        const sql = 'SELECT * FROM processo_passo_cadastro where id = '+id
        //console.log("sql gerado:", sql)
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0])
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static getUsuarioPapel(papel_id){
        const sql = 'SELECT * FROM usuario_papel where papel_id = '+papel_id
        //console.log("sql gerado:", sql)
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows)
                }
            });
        });
    }

    static getUsuarioResponsavel(processo_id){
        const sql = 'SELECT usuario_id FROM processo where id = '+processo_id
        //console.log("sql gerado:", sql)
        return new Promise(function (resolve, reject) {
            // Do async job
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows)
                }
            });
        });
    }

    static delete(id) {
        const sql = "delete from processo where id = "+id;
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static deleteProcessoExecucao(id) {
        return new Promise(async function (resolve, reject) {
            await Processo.deleteProcessoCampos(id);
            await Processo.deleteProcessoPasso(id);
            await Processo.delete(id);
            resolve(true)
        });
    }

    static deleteProcessoCampos(id){
        const sql = `delete from processo_campos where processo_passo_id IN (select id from processo_passo where processo_id = `+id+`) and id > 0;`

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static deleteProcessoPasso(id){
        const sql = `delete from processo_passo where processo_id = `+id+` and id > 0`

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static alteraResponsavel({processo_id,responsavel_id}){
        return new Promise(async function (resolve, reject) {
            await Processo.changeResponsavel(processo_id, responsavel_id)
            await Processo.changeResponsavelPasso(processo_id, responsavel_id)
            resolve(true)
        })
    }

    static changeResponsavel(processo_id, responsavel_id){
        const sql = "UPDATE processo SET usuario_id = "+responsavel_id+" WHERE id = "+processo_id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static changeResponsavelPasso(processo_id, responsavel_id){
        const sql = "UPDATE processo_passo SET responsavel_id = "+responsavel_id+" WHERE id > 0 and processo_id = "+processo_id+" and status_id = 5 and papel_id = 0"
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static iniciaSubProcesso(processo_id, processo_cadastro_id, responsavel_id){
        return new Promise(async function (resolve, reject) {
            try {
                const processo = await Processo.getProcesso(processo_id)
                const subProcesso = await processoPassoCadastro.getSubProcessoAtual(processo_cadastro_id)
                if(subProcesso && (processo.processo_cadastro_id != subProcesso.id)){
                    const novoProcesso = {
                        data_inicio: MomentFunctions.dateTimeAtual(),
                        status: 'Ativo',
                        usuario_id: responsavel_id,
                        processo_cadastro_id : subProcesso.id,
                        empresa_id: 1,
                        categoria_id: processo.categoria_id,
                        projeto_id: processo.projeto_id,
                        descricao: subProcesso.nome +" - "+processo.descricao,
                    }

                    const passo = await processoPassoCadastro.getPrimeiroPassoProcesso(subProcesso.id)
                    
                    if(passo){
                        novoProcesso.processo_passo_cadastro_id = passo.id
                        const processoInserido = await Processo.insert(novoProcesso)

                        let estimativa = null

                        if(passo.estimativa){
                            estimativa = MomentFunctions.getPrazo(passo.estimativa)
                        }

                        const novoPasso = {
                            data_modificacao: MomentFunctions.dateTimeAtual(),
                            processo_id: processoInserido.insertId,
                            usuario_id: null,
                            processo_passo_cadastro_id: passo.id,
                            responsavel_id: passo.papel_id === 0 ? responsavel_id : null,
                            estimativa: estimativa,
                            papel_id: passo.papel_id,
                            status_id: passo.subprocesso == 1 && !passo.bloqueante ? 2 : 5,
                        }

                        if(passo.subprocesso == 1){
                            const novoSubProcesso = await Processo.iniciaSubProcesso(processoInserido.insertId, passo.subprocesso_cadastro_id, responsavel_id);
                            novoPasso.subprocesso_id = novoSubProcesso.insertId
                        }

                        const passoInserido = await processoPasso.insert(novoPasso)
                        await Processo.update({
                            id: processoInserido.insertId,
                            processo_passo_id: passoInserido.insertId
                        })

                        resolve(processoInserido)
                    } else{
                        resolve(false)
                    }
                    
                } else{
                    resolve(false)
                }

            } catch (error) {
                reject(error)
            }
        })
    }

    static editaTarefaAtualProcesso(id){
        const sql = "UPDATE processo_passo SET status_id = '1' WHERE processo_id = "+id+" order by id desc limit 1"
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static atualizaProcesso(id, processo_passo_cadastro_id, processo_passo_id){
        const sql = "UPDATE processo SET processo_passo_cadastro_id = "+processo_passo_cadastro_id+", processo_passo_id = "+processo_passo_id+", condition_error = '0' WHERE id = "+id
        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static continuaProcesso(data){
        return new Promise(async function (resolve, reject) {
            try {

                if(data.id && data.id != 0){ // se data.id for 0 é para finalizar o processo
                    const passo_cadastro = await Processo.simpleGetProcessoPassoCadastro(data.id) 
                    let subprocesso_id = null
    
                    await Processo.editaTarefaAtualProcesso(data.processo_id)
                    if(passo_cadastro && passo_cadastro.subprocesso === 1){
                        subprocesso_id = await Processo.iniciaSubProcesso(data.processo_id, passo_cadastro.subprocesso_cadastro_id, data.user);
                    }
                     let response
                    if(subprocesso_id && subprocesso_id.insertId){
                        response = await processoPasso.insert({
                            processo_id: data.processo_id,
                            processo_passo_cadastro_id: data.id,
                            status_id: 5,
                            papel_id: data.papel_id,
                            subprocesso_id: data.subprocesso_id,
                            data_inicio: utils.dateTimeAtual(),
                            data_modificacao: utils.dateTimeAtual(),
                            subprocesso_id: subprocesso_id.insertId
                        })
                    } else{
                        response = await processoPasso.insert({
                            processo_id: data.processo_id,
                            processo_passo_cadastro_id: data.id,
                            status_id: 5,
                            papel_id: data.papel_id,
                            subprocesso_id: data.subprocesso_id,
                            data_inicio: utils.dateTimeAtual(),
                            data_modificacao: utils.dateTimeAtual(),
                        })
                    }
    
                    await Processo.atualizaProcesso(data.processo_id, data.id, response.insertId )
                    resolve(response)
                } else{ // finaliza o processo atribuindo uma data_fim
                    let response = await Processo.finalizaProcesso(data.processo_id)
                    resolve(response)
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    static finalizaProcesso(processo_id){
        const sql = "UPDATE processo SET data_fim = '"+MomentFunctions.dateTimeAtual()+"' WHERE id = "+processo_id

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows, fields);
                }
            });
        });
    }

    static simpleGetProcessoPassoCadastro(processo_passo_cadastro_id){

        const sql = "SELECT * FROM processo_passo_cadastro where  id = "+processo_passo_cadastro_id

        return new Promise(function (resolve, reject) {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                } else {
                    if(rows.length > 0){
                        resolve(rows[0])
                    } else{
                        resolve(false)
                    }
                }
            });
        });
    }

    static atualizaTitulo(){
        return new Promise(async function (resolve, reject) {
            try {
                const processos = await Processo.select()
                const map = processos.map(async (p) => {
                    try {
                        let titulo = await Processo.geraTituloProcesso(p.id)
                        titulo = titulo.replace(/'/g, "\\'");
                        await Processo.update({id: p.id, descricao: titulo})
                        return "sucesso";
                    } catch (error) {
                        console.error(error);
                        return error;
                    }
                })
                await Promise.all(map)
                resolve(true);
            } catch (error) {
                reject(error)
            }
        })
    }

}
module.exports = Processo;