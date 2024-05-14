const ProcessoCampoCadastroRepository = require("../repositories/processo_campo_cadastro_repository.js");
const processoFluxoCadastroController = require("../processo/processo_fluxo_cadastro/processo_fluxo_cadastro_controller.js");
const ProcessoPassoCadastroRepository = require("../repositories/processo_passo_cadastro_repository.js");
const ProcessoCadastroRepository = require("../repositories/processo_cadastro_repository.js");
const Utils = require("../utils/utils.js");

module.exports = class ProcessoCadastroService {
  constructor(processoRepository) {
    this.processoRepository = processoRepository;
  }
  static async insertBatch(
    data,
    nodes,
    newProcessData,
    // processoCadastroId,
    processoAnteriorId
  ) {
    if (!data || data.length === 0) {
      throw new ErrorModel(400, "Nenhum dado fornecido para inserção em lote.");
    }

    const processoCadastroId = await ProcessoCadastroRepository.create(
      newProcessData
    );

    data.forEach((item) => {
      item.processo_cadastro_id = processoCadastroId;
      if (item.caminho_padrao && item.caminho_padrao === "null") {
        item.caminho_padrao = 0;
      }
    });

    const oldPassos = await ProcessoPassoCadastroRepository.getAllByProcesso(
      processoAnteriorId
    );

    const oldPassosIndexed = oldPassos.reduce((acc, item) => {
      acc[item.id_diagrama] = item;
      return acc;
    }, {});

    const result = await ProcessoPassoCadastroRepository.insertProcessSteps(
      Utils.matchObjects(data.map((item) => {
        const newItem = {
          ...oldPassosIndexed[item.id_diagrama],
          ...item,
        }
        delete newItem.id;
        return newItem;
      })),
      "processo_passo_cadastro"
    );

    const newPassos = await ProcessoPassoCadastroRepository.getManyFromId(
      result.insertId,
      data.length
    );

    const newPassosIndexed = newPassos.reduce((acc, item) => {
      acc[item.id_diagrama] = item;
      return acc;
    }, {});

    nodes.forEach((node) => (node.idBanco = newPassosIndexed[node.id]?.id));
    const flow = createFlow(nodes);
    flow.forEach((item) => {
      item.processo_cadastro_id = processoCadastroId;
      item.status = "Ativo";
      item.valor_condicao = "";
    });

    // const [_, oldPassos] = await Promise.all([
    await ProcessoPassoCadastroRepository.createFlow(flow);
    // ProcessoPassoCadastroRepository.getAllByProcesso(processoAnteriorId),
    // ]);

    const remainingPassos = oldPassos.filter((oldPasso) => {
      return newPassosIndexed[oldPasso.id_diagrama];
    });

    const remainingOldPassosIndexById = remainingPassos.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    if (remainingPassos.length > 0) {
      var oldFields = await ProcessoCampoCadastroRepository.getCamposByPassos(
        remainingPassos.map((passo) => passo.id)
      );

      const newFieldsResult =
        await ProcessoCampoCadastroRepository.insertManyCampos(
          oldFields.map((field) => {
            const newEntry = {
              ...field,
              processo_passo_cadastro_id:
                newPassosIndexed[
                  remainingOldPassosIndexById[field.processo_passo_cadastro_id]
                    .id_diagrama
                ].id,
              processo_cadastro_id: processoCadastroId,
            };
            delete newEntry.id;
            return newEntry;
          })
        );

      const newFields =
        await ProcessoCampoCadastroRepository.getManyStartingAtId(
          newFieldsResult.insertId,
          oldFields.length
        );

      /// Serve para mapear as versões antigas dos campos com as novas, para ser utilizados posteriormente
      const newFieldsIndexedByOldFieldId = newFields.reduce((acc, item) => {
        const newPasso = newPassos.find(
          (p) => p.id === item.processo_passo_cadastro_id
        );
        const oldPasso = oldPassos.find(
          (p) => p.id_diagrama === newPasso.id_diagrama
        );
        const oldField = oldFields.find(
          (f) =>
            f.processo_passo_cadastro_id === oldPasso.id &&
            f.nome === item.nome &&
            f.ordem === item.ordem &&
            f.tipo === item.tipo
        );

        acc[oldField.id] = item;
        return acc;
      }, {});

      const fieldsId = oldFields.map((field) => field.id);
      const [select, masks, copies, files] = await Promise.all([
        ProcessoCampoCadastroRepository.getOpcaoSelectByCampos(fieldsId),
        ProcessoCampoCadastroRepository.getMascaraByCampos(fieldsId),
        ProcessoCampoCadastroRepository.getCopiaByCampos(fieldsId),
        ProcessoCampoCadastroRepository.getArquivoByCampos(fieldsId),
      ]);

      const newFieldDetails = await Promise.all([
        select.length == 0
          ? null
          : ProcessoCampoCadastroRepository.insertManyOpcoesSelect(
              select.map((item) => {
                delete item.id;
                const newParentField =
                  newFieldsIndexedByOldFieldId[item.processo_campo_cadastro_id];
                return {
                  ...item,
                  processo_campo_cadastro_id: newParentField.id,
                  processo_cadastro_id: processoCadastroId,
                };
              })
            ),
        masks.length == 0
          ? null
          : ProcessoCampoCadastroRepository.insertManyMascara(
              masks.map((item) => {
                delete item.id;
                const newParentField =
                  newFieldsIndexedByOldFieldId[item.processo_campo_cadastro_id];
                return {
                  ...item,
                  processo_campo_cadastro_id: newParentField.id,
                  processo_cadastro_id: processoCadastroId,
                };
              })
            ),
        copies.length == 0
          ? null
          : ProcessoCampoCadastroRepository.insertManyCopia(
              copies.map((item) => {
                delete item.id;
                const newParentField =
                  newFieldsIndexedByOldFieldId[item.processo_campo_cadastro_id];
                const newCopiedField =
                  newFieldsIndexedByOldFieldId[item.processo_campo_copia_id];

                return {
                  ...item,
                  processo_campo_cadastro_id: newParentField.id,
                  processo_cadastro_id: processoCadastroId,
                  processo_campo_copia_id: newCopiedField.id,
                };
              })
            ),
        files.length == 0
          ? null
          : ProcessoCampoCadastroRepository.insertManyArquivoCampo(
              files.map((item) => {
                delete item.id;
                let newArquiveField;
                const newParentField =
                  newFieldsIndexedByOldFieldId[item.processo_campo_cadastro_id];
                if(item.cadastro_nova_pasta_campo_id && item.cadastro_nova_pasta_campo_id !== 0){
                  newArquiveField = newFieldsIndexedByOldFieldId[item.cadastro_nova_pasta_campo_id];
                } else{
                  newArquiveField = { id: 0 }
                }
                return {
                  ...item,
                  processo_campo_cadastro_id: newParentField.id,
                  cadastro_nova_pasta_campo_id: newArquiveField.id
                };
              })
            ),
      ]);
    }

    await processoFluxoCadastroController.editProcessFlow(
      processoAnteriorId,
      processoCadastroId
    );

    await processoFluxoCadastroController.updateFields(
      processoAnteriorId,
      processoCadastroId
    );

    return processoCadastroId;
  }
};

function createFlow(nodes) {
  const flow = [];
  for (let no of nodes) {
    if (no.type != "start" && no.type != "end") {
      for (let filho of no.children) {
        let idBancoFilho = achaFilho(filho, nodes);
        if (
          no.idBanco &&
          (idBancoFilho.idBanco || idBancoFilho.id.includes("EndEvent"))
        ) {
          if (no.type == "decision") {
            var anteriores = achaPai(no.id, nodes);
            for (var anterior of anteriores) {
              flow.push({
                passo_atual: anterior,
                passo_seguinte: idBancoFilho.id.includes("EndEvent")
                  ? 0
                  : idBancoFilho.idBanco,
                passo_decisao: no.type == "decision" ? no.idBanco : 0,
                condicao: no.type == "decision" ? "sim" : "nao",
              });
            }
          } else {
            if (idBancoFilho.type != "decision") {
              flow.push({
                passo_atual: no.idBanco,
                passo_seguinte: idBancoFilho.id.includes("EndEvent")
                  ? 0
                  : idBancoFilho.idBanco,
                passo_decisao: no.type == "decision" ? no.idBanco : 0,
                condicao: no.type == "decision" ? "sim" : "nao",
              });
            }
          }
        }
      }
    }
  }
  return flow;
}

const achaPai = (id, nodes) => {
  var retorno = [];
  nodes.map((no) => {
    if (no.children) {
      no.children.map((filho) => {
        if (filho == id) {
          retorno.push(no.idBanco);
        }
      });
    }
  });
  return retorno;
};

const achaFilho = (filho, nodes) => {
  let retorno = false;
  nodes.forEach((no) => {
    if (filho == no.id) {
      retorno = no;
    }
  });
  return retorno;
};
