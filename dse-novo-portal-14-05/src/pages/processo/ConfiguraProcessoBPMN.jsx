import React, { useState, useEffect } from "react";
import "../../components/bpmn/App.css";
import BpmnModelerComponent from "../../components/bpmn/components/bpmn/bpmn.modeler.component.hook";
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
import { dataAtual } from "../../utils/utils";
import { GetSession } from "../../session";
import { api } from "../../config.ts";
import Loading from "../../components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { notification } from "src/components/notification/notiflix.js";

export default function ConfiguraProcessoBPMN() {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processo, setProcesso] = useState();
  const [papel, setPapel] = useState();
  const [diagrama, setDiagrama] = useState("");

  useEffect(() => {
    getProcesso();
  }, []);

  const getProcesso = () => {
    api.get("processo-cadastro/diagrama/" + params.id).then((processo) => {
      setProcesso(processo.data);
      setDiagrama(processo.data.xml);
      getPapeis();
    });
  };

  const cadastraCamposPassoAntigo = async (
    processoAntigoID,
    processoNovoID,
    diagramaID,
    passoID
  ) => {
    try {
      var response = await api.post(
        "processo-passo-cadastro/cadastracampospassoantigo",
        {
          processoAntigoID: processoAntigoID,
          processoNovoID: processoNovoID,
          diagramaID: diagramaID,
          passoID: passoID,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      // notification('error', 'Ocorreu um erro')
      return [];
    }
  };

  const getPapeis = () => {
    api.get("/papel").then((papel) => {
      setPapel(papel.data);
    });
  };

  const salvaProcesso = async (nodes, xml) => {
    setLoading(true);

    const nos_cadastrados = [];
    let processo_cadastrado_id;
    let startNode;

    nodes.forEach((n, index) => {
      if (n.type == "start") {
        startNode = nodes[index].children[0];
      }
    });

    const dadosPassos = [];

    const verificaEstagioFim = (no) => {
      let retorno = false;
      if (no.children) {
        no.children.forEach((f) => {
          if (f.includes("EndEvent")) {
            retorno = true;
          }
        });
      }
      return retorno;
    };

    const varrePassos = (no_id) => {
      if (nos_cadastrados.indexOf(no_id) == -1) {
        for (const no of nodes) {
          if (
            no.type == "task" ||
            no.type == "subprocess" ||
            no.type == "decision"
          ) {
            if (no.id == no_id) {
              const ordem = dadosPassos.length + 1;
              const estagio =
                no.id == startNode && nodes.length > 3
                  ? "inicial"
                  : verificaEstagioFim(no)
                  ? "final"
                  : "intermediario";

              const dadosPasso = {
                nome: no.name
                  ? no.name
                  : no.type == "decision"
                  ? "Decisão " + ordem
                  : "Passo " + ordem,
                descricao: no.name ? no.name : "passo " + ordem,
                decisao: no.type == "decision" ? "sim" : "nao",
                estagio: estagio,
                processo_cadastro_id: processo_cadastrado_id,
                papel_id: no.raia.papel_id ? no.raia.papel_id : 0,
                flag: "Sim",
                status: "Ativo",
                ordem: ordem,
                id_diagrama: no.id,
                estimativa: no.estimativa,
                caminho_padrao: no.caminho_padrao ? no.caminho_padrao : 0,
                subprocesso: no.type == "subprocess" ? 1 : 0,
              };

              dadosPassos.push(dadosPasso);

              nos_cadastrados.push(no.id);

              for (const filho of no.children) {
                if (!filho.includes("EndEvent")) {
                  varrePassos(filho);
                }
              }
            }
          }
        }
      }
    };

    try {
      const processo_anterior_id = params.id;

      varrePassos(startNode);
      const result = await api.post("processo-passo-cadastro/batch-insert", {
        dadosPassos,
        nodes,
        processo_anterior_id,
        novoProcesso: {
          nome: processo.nome,
          date: dataAtual(),
          status: "Inativo",
          usuario_id: GetSession("@dse-usuario").id,
          empresa_id: GetSession("@dse-usuario").empresa_id,
          tipo: "Operacional",
          categoria_id: processo.categoria_id,
          versao: parseInt(processo.versao) + 1,
          ref_id: processo.id,
          xml: xml,
        },
      });
      const processo_cadastrado_id = result.data.result;

      redirecionaProcesso(params.id, processo_cadastrado_id);
    } catch (error) {
      setLoading(false);
      notification(
        "error",
        "Desculpe, ocorreu um problema ao salvar o processo."
      );
    }
  };

  const redirecionaProcesso = (anterior_id, novo_processo_id) => {
    setLoading(false);
    navigate("/gerencia-processo/" + anterior_id + "/" + novo_processo_id);
  };

  return (
    <div>
      {papel ? (
        <>
          <Loading open={loading} />
          <BpmnModelerComponent
            caminhoPadrao={processo.caminho_padrao}
            diagrama={diagrama}
            raias={papel}
            callback={salvaProcesso}
            processoAnterior={params.id}
          />
        </>
      ) : null}
    </div>
  );
}
