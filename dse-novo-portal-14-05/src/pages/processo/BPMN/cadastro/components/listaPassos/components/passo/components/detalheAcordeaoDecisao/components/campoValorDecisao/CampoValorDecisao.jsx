import React, { useState, useEffect } from "react";
import { CamposIndexed, Passos } from "../../../../../../PassoAtom";
import { useAtom, useAtomValue } from "jotai";
import update from "immutability-helper";
import TextFieldValorDecisao from "./components/TextFieldValorDecisao";
import SelectValorDecisao from "./components/SelectValorDecisao";

import { TextField } from "@mui/material";

export default function CampoValorDecisao(props) {
  const camposIndexed = useAtomValue(CamposIndexed);
  const [passos, setPassos] = useAtom(Passos);
  const startCampo = getCampo(
    passos,
    props.index,
    props.indexFluxo,
    props.indexDecisao,
    camposIndexed
  );
  const [campoSelecionado, setCampoSelecionado] = useState(startCampo);

    useEffect(() =>{
        if(passos[props.index].processo_fluxo_cadastro[props.indexFluxo].condicoes[props.indexDecisao].processo_campo_cadastro_id){
            passos.map((passo) => {
                if(passo.decisao == 'nao'){
                    passo.campos.map((campo) => {
                        if(campo.id == passos[props.index].processo_fluxo_cadastro[props.indexFluxo].condicoes[props.indexDecisao].processo_campo_cadastro_id){
                            // setCampoSelecionado(campo)
                            if(campo.tipo !== 'Campo Cópia'){
                                setCampoSelecionado(campo)
                            } else{
                                passos.map((p) => {
                                    if(passo.decisao == 'nao'){
                                        if(p.campos && p.campos.length > 0){
                                            p.campos.map((c) => {
                                                if(c.id.toString() === campo.processo_campo_copia.processo_campo_copia_id.toString()){
                                                    setCampoSelecionado(c)
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } else{
            setCampoSelecionado(null)
            resetaValorCondicao()
        }
    },[passos[props.index].processo_fluxo_cadastro[props.indexFluxo].condicoes[props.indexDecisao].processo_campo_cadastro_id])

  const resetaValorCondicao = () => {
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [props.indexFluxo]: {
              condicoes: {
                [props.indexDecisao]: {
                  valor_condicao: {
                    $set: "",
                  },
                },
              },
            },
          },
        },
      })
    );
  };

  return campoSelecionado ? (
    campoSelecionado.tipo == "Seleção" ||
    campoSelecionado.tipo == "Multi-Seleção" ? (
      <SelectValorDecisao
        campoSelecionado={campoSelecionado}
        index={props.index}
        indexFluxo={props.indexFluxo}
        indexDecisao={props.indexDecisao}
      />
    ) : (
      <TextFieldValorDecisao
        campoSelecionado={campoSelecionado}
        index={props.index}
        indexFluxo={props.indexFluxo}
        indexDecisao={props.indexDecisao}
      />
    )
  ) : (
    // caso nao tenha campo selecionado exibe um campo vazio desabilitado
    <TextField
      value={""}
      style={{ width: "100%" }}
      label="Valor do campo"
      variant="outlined"
      disabled
    />
  );
}

function getCampo(passos, index, indexFluxo, indexDecisao, camposIndexed) {
  let startField = null;
  // return startField
  const campo =
    camposIndexed[
      passos[index].processo_fluxo_cadastro[indexFluxo].condicoes[indexDecisao]
        .processo_campo_cadastro_id
    ];
  if (campo?.tipo !== "Campo Cópia") {
    startField = campo;
  } else {
    passos.forEach((p) => {
      if (p.campos && p.campos.length > 0) {
        p.campos.forEach((c) => {
          if (
            c.id.toString() ===
            campo.processo_campo_copia.processo_campo_copia_id.toString()
          ) {
            startField = c;
          }
        });
      }
    });
  }
  return startField

}
