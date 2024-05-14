const con = require("../../../data_base");
const sqlUtils = require("../../utils/sqlUtils.js");
const processoObservadores = require("../processo_observadores/processo_observadores.js");
const processoTitulo = require("../processo_titulo/processo_titulo");
const DefinePrazoProcesso = require("../../define_prazo_processo/define_prazo_processo");
const processoArquivo = require("../processo_arquivo/processo_arquivo");
const processoPasso = require("../processo_passo/processo_passo");
const Processo = require("../processo/processo");
const ProjetoCadastro = require("../../projeto/projeto_cadastro/projeto_cadastro.js");
const MomentFunctions = require("../../../momentFunctions");
const processoFluxoCadastroModel = require("./processo_fluxo_cadastro_model.js");

class processoFluxoCadastroController {
  static async editProcessFlow(processo_anterior, processo_novo) {
    try {
      const observadores_anterior =
        await processoFluxoCadastroModel.getObservers({
          id: processo_anterior,
          area: "Cadastro",
        });
      const novos_observadores = observadores_anterior.map((obs) => [
        processo_novo,
        "Cadastro",
        obs.id,
      ]);
      if (novos_observadores.length > 0) {
        await processoFluxoCadastroModel.movesObservers(novos_observadores);
      }

      const fluxo_processo_anterior = await processoFluxoCadastroModel.getFlow(
        processo_anterior
      );
      const passos_processo = await processoFluxoCadastroModel.getSteps(
        processo_anterior,
        processo_novo
      );
      const campos_processo = await processoFluxoCadastroModel.getFields(
        passos_processo.map((passo) => passo.id),
        processo_anterior,
        processo_novo
      );
      const fluxo_convertido =
        await processoFluxoCadastroController.convertingToNewFlow(
          fluxo_processo_anterior,
          passos_processo,
          processo_novo,
          campos_processo
        );
      const fluxo_processo_novo = await processoFluxoCadastroModel.getFlow(
        processo_novo
      );

      await processoFluxoCadastroController.removePreviousFlow(
        fluxo_convertido,
        fluxo_processo_novo
      );
      await processoFluxoCadastroController.mapNewFlow(
        fluxo_convertido,
        fluxo_processo_novo,
        processo_novo
      );

      return {};
    } catch (error) {
      throw error;
    }
  }

  static async updateFields(processo_anterior, processo_novo) {
    try {
      await processoFluxoCadastroModel.updateArchivesFields(processo_novo);
      await processoFluxoCadastroModel.updateCopyFields(processo_novo);
      await processoTitulo.moveTitulo(processo_anterior, processo_novo);
      await DefinePrazoProcesso.movePrazo(processo_anterior, processo_novo);

      return "Sucesso";
    } catch (error) {
      throw error;
    }
  }

  static async convertingToNewFlow(
    fluxo_processo_anterior,
    passos_processo,
    processo_novo,
    campos_processo
  ) {
    var arr = [];

    const map = fluxo_processo_anterior.map(
      async ({
        passo_atual,
        passo_seguinte,
        passo_decisao,
        valor_condicao,
        processo_campo_cadastro_id,
      }) => {
        const novo_passo_atual =
          await processoFluxoCadastroController.findNewStepId(
            passos_processo,
            passo_atual,
            processo_novo
          );
        const novo_passo_seguinte =
          await processoFluxoCadastroController.findNewStepId(
            passos_processo,
            passo_seguinte,
            processo_novo
          );
        const novo_passo_decisao =
          await processoFluxoCadastroController.findNewStepId(
            passos_processo,
            passo_decisao,
            processo_novo
          );
        const campo_novo = await processoFluxoCadastroModel.queryNewFields(
          processo_campo_cadastro_id,
          processo_novo
        ); //ToDo: otimizar essa função

        if (
          novo_passo_atual &&
          (novo_passo_seguinte || novo_passo_seguinte === 0) &&
          novo_passo_decisao
        ) {
          arr.push({
            condicao: "sim",
            valor_condicao,
            status: "Ativo",
            passo_atual: novo_passo_atual,
            passo_seguinte: novo_passo_seguinte,
            passo_decisao: novo_passo_decisao ? novo_passo_decisao : 0,
            processo_campo_cadastro_id: campo_novo.id,
            processo_cadastro_id: processo_novo,
          });
        }
      }
    );

    await Promise.all(map);
    return arr;
  }

  static findNewStepId(passos_processo, idPassoDesejado, idProcessoDesejado) {
    // eh o mesmo que achaPassoProcesso
    const passoEncontrado = passos_processo.find(
      (passo) => passo.id === idPassoDesejado
    ); // fazendo macaquice
    if (passoEncontrado) {
      const id_diagramaEncontrado = passoEncontrado.id_diagrama;
      const passo_novo_processo = passos_processo.find((passo) => {
        if (
          passo.id_diagrama === id_diagramaEncontrado &&
          passo.processo_cadastro_id === idProcessoDesejado
        ) {
          return passo;
        }
      });
      if (passo_novo_processo) {
        return passo_novo_processo.id;
      }
    }
    return 0; // deveria ser 0, por causa do caso do fim do maluco
  }

  static removePreviousFlow(fluxo_convertido, fluxo_novo) {
    return new Promise(async function (resolve, reject) {
      try {
        const idsToRemove = [];

        for (const fn of fluxo_novo) {
          for (const fc of fluxo_convertido) {
            if (
              fn.passo_atual === fc.passo_atual &&
              fn.passo_seguinte === fc.passo_seguinte
            ) {
              idsToRemove.push(fn.id);
            }
          }
        }

        if (idsToRemove.length > 0) {
          await processoFluxoCadastroModel.removeFlow(idsToRemove);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static mapNewFlow(fluxo_convertido, fluxo_processo_novo, processo_novo_id) {
    return new Promise(async function (resolve, reject) {
      try {
        const fluxo_registrado =
          await processoFluxoCadastroModel.getByProcessoCadastroId(
            processo_novo_id
          );
        const fluxo_to_be_registered = [];

        fluxo_processo_novo.map(async (fn) => {
          fluxo_convertido.map(async (fc) => {
            if (fn.passo_seguinte == fc.passo_seguinte) {
              const fluxo = {
                condicao: fc.condicao,
                valor_condicao: fc.valor_condicao,
                status: fc.status,
                passo_atual: fc.passo_atual,
                passo_seguinte: fc.passo_seguinte,
                passo_decisao: fc.passo_decisao,
                processo_campo_cadastro_id: fc.processo_campo_cadastro_id,
                processo_cadastro_id: fc.processo_cadastro_id,
              };
              if (
                !fluxo_registrado.some(
                  (e) =>
                    fluxo.condicao === e.condicao &&
                    fluxo.valor_condicao === e.valor_condicao &&
                    fluxo.status === e.status &&
                    fluxo.passo_atual === e.passo_atual &&
                    fluxo.passo_seguinte === e.passo_seguinte &&
                    fluxo.passo_decisao === e.passo_decisao &&
                    fluxo.processo_campo_cadastro_id ===
                      e.processo_campo_cadastro_id &&
                    fluxo.processo_cadastro_id === e.processo_cadastro_id
                )
              ) {
                fluxo_to_be_registered.push(fluxo);
                fluxo_registrado.push(fluxo);
              }
            }
          });
        });
        let result;
        if (fluxo_to_be_registered.length > 0) {
          result = await processoFluxoCadastroModel.saveMany(
            fluxo_to_be_registered
          );
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = processoFluxoCadastroController;
