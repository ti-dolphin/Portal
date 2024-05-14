const con = require("../../../data_base");

module.exports = class ProjetoDocumentoRepository {
  static getDocumentsExpiringBetween(endDate) {
    return new Promise((resolve, reject) => {
      try {
        con.query(
          `
          select * from
          (
          select pa.id, 
          IFNULL(str_to_date(valor, "%d/%m/%Y"), str_to_date(valor, "%Y-%m-%d")) as "parsed_date",
          pda.projeto_documento_id as "projeto_document_id",
          pd.titulo as "titulo",
          pda.pasta_atributo_id as "pasta_atributo_id",
          cta.categoria_id as "categoria_id",
          cr.tipo,
          IFNULL(u.id, u2.id) as "user_id",
          IFNULL(u.nome, u2.nome) as "user_name"
          from projeto_documento_atributo as pda
          left join pasta_atributo pa
          on pa.id = pda.pasta_atributo_id
          inner join categoria_tem_atributo cta
          on cta.atributo_id = pa.id
          inner join categoria_responsavel cr
          on cr.categoria_id=cta.categoria_id
          left join usuario u
          on u.id=cr.usuario
          left join usuario_papel up
          on up.papel_id=cr.papel
          left join usuario u2
          on up.usuario_id=u2.id
          left join projeto_documento pd
          on pd.id=pda.projeto_documento_id
          where pa.mask = 'Data de vencimento' and valor is not null and valor != "" and valor != "null"
          order by pa.id DESC) as r
          where ` +
          `r.parsed_date is not null and parsed_date > '2023-12-10' and parsed_date < '${endDate.toISOString().split('T')[0]}' and user_id is not null;`
          ,
          (err, rows, fields) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static getDocumentsExpiringReportsAdmin(endDate) {
    return new Promise((resolve, reject) => {
      try {
        con.query(
          `SELECT * FROM (
            SELECT pd.id, pd.titulo as documento, pc.id as projeto_id, pc.nome as projeto, pd.categoria_id,
            pp.id as pasta_id, pp.nome as pasta, pd.isFavorite, IFNULL(str_to_date(valor, "%d/%m/%Y"), str_to_date(valor, "%Y-%m-%d")) as data_vencimento
            FROM projeto_documento_atributo pda 
            JOIN pasta_atributo pa ON pda.pasta_atributo_id = pa.id
            JOIN projeto_documento pd ON pda.projeto_documento_id = pd.id
            JOIN projeto_cadastro pc ON pd.projeto_id = pc.id 
            JOIN projeto_pasta pp ON pda.projeto_diretorio_id = pp.id
            WHERE pd.status = 'Ativo' and pa.mask = 'Data de vencimento' and pda.valor is not null and pda.valor != "" and pda.valor != "null"
          ) AS r where r.data_vencimento is not null and r.data_vencimento > '2023-12-10' and r.data_vencimento < ? 
          group by r.categoria_id, r.id, r.documento, r.projeto_id, r.projeto, r.pasta_id, r.pasta, r.data_vencimento order by r.data_vencimento`,
          [endDate.toISOString().split('T')[0]],
          (err, rows, fields) => {
            if (err) reject(err);
            resolve(rows);
          }
        );

      } catch (error) {
        reject(error)
      }
    })
  }

  static getDocumentsExpiringReports(usuario_id, endDate) {
    return new Promise((resolve) => {
      try {
        con.query(
          `SELECT * FROM (
            SELECT pd.id, pd.titulo as documento, pc.id as projeto_id, pc.nome as projeto, pd.categoria_id,
            pp.id as pasta_id, pp.nome as pasta, pd.isFavorite, IFNULL(str_to_date(valor, "%d/%m/%Y"), str_to_date(valor, "%Y-%m-%d")) as data_vencimento
            FROM projeto_documento_atributo pda 
            JOIN pasta_atributo pa ON pda.pasta_atributo_id = pa.id
            JOIN projeto_documento pd ON pda.projeto_documento_id = pd.id
            JOIN projeto_cadastro pc ON pd.projeto_id = pc.id 
            JOIN projeto_pasta pp ON pda.projeto_diretorio_id = pp.id
            JOIN categoria_tem_atributo cta ON cta.atributo_id = pda.id
            JOIN categoria_responsavel cr on cr.categoria_id = pd.categoria_id
            WHERE (cr.usuario = `+usuario_id+` or cr.papel IN (SELECT papel_id FROM usuario_papel where usuario_id = `+usuario_id+` group by papel_id)) and
              pd.status = 'Ativo' and pa.mask = 'Data de vencimento' and pda.valor is not null and pda.valor != "" and pda.valor != "null"
            ) AS r where r.data_vencimento is not null and r.data_vencimento > '2023-12-10' and r.data_vencimento < ?
            group by r.categoria_id, r.id, r.documento, r.projeto_id, r.projeto, r.pasta_id, r.pasta, r.data_vencimento order by r.data_vencimento`,

          [endDate.toISOString().split('T')[0]],
          (err, rows, fields) => {
            if (err){
              console.log(err)
              resolve([]);
            } 
            resolve(rows);
          }
        );

      } catch (error) {
        resolve([])
      }
    })
  }



  static async saveSentNotifications(data) {
    const sql = `insert into notificacoes_enviadas_documento_expirando (user_id, document_id, days_to_expire) values ?`;
    return new Promise((resolve, reject) => {
      try {
        con.query(sql, [data], (err, rows, fields) => {
          if (err) reject(err);
          resolve(rows);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async getSentNotifications(virtualIds) {
    const sql = `
      select * from
      (SELECT *, concat(document_id, "-", user_id) as "virtual_id"
      FROM notificacoes_enviadas_documento_expirando order by id desc) as t1 ` +
      `where t1.virtual_id in (${virtualIds.map(id => `'${id}'`).join(', ')}) ` +
      "order by created_at asc;"
    return new Promise((resolve, reject) => {
      try {
        con.query(sql, (err, rows, fields) => {
          if (err) reject(err);
          resolve(rows);
        });
      } catch (error) {
        reject(error);
      }
    })
  }
};
