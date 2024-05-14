import React from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    Switch
} from "@mui/material"
/**
 * @param {String} name Nome do switch.
 * @param {Boolean} state Estado que corresponderá ao switch.
 * @param {String} label Texto que irá aparecer ao lado do switch.
 * @param {function()} callback Função de callback do componente.
 * @param {String} color *Opcional* Define a cor do switch.
 * @returns 
 */

export default function SwitchSelecaoPastaFilha(props) {
  const [passos,setPassos] = useAtom(Passos)

  const setaConverteImagem = (event) => {
    setPassos(update(passos,{
        [props.index]:{ // id do passo
            campos: { // array de campos
                [props.campoIndex]: { // id do campo 
                    processo_campo_arquivo : {
                        selecao_filha : {
                            $set : event.target.checked
                        },
                        cadastro_nova_pasta_campo_id : {
                            $set : 0
                        }
                    }
                }
            }
        }
    }))
  }

  return (
    <div>
        <span>Exigir seleção de pasta filha ao cadastrar arquivo</span>
        <Switch
            checked= {passos[props.index].campos[props.campoIndex].processo_campo_arquivo.selecao_filha ? true : false}
            onChange= {setaConverteImagem}
            name= {'nome'}
            color= {props.color ? props.color : "primary"}
        />
    </div>
  );
}
