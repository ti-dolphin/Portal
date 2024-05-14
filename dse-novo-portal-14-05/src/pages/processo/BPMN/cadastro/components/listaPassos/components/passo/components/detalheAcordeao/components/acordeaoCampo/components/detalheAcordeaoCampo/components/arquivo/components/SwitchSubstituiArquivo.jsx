import React from 'react';
import { useAtom } from "jotai"
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

export default function SwitchSubstituiArquivo(props) {
  const [passos,setPassos] = useAtom(Passos)

  const setaSubstituiArquivo = (event) => {
    setPassos(update(passos,{
        [props.index]:{ // id do passo
            campos: { // array de campos
                [props.campoIndex]: { // id do campo 
                    processo_campo_arquivo : {
                        substitui_arquivo : {
                            $set : event.target.checked
                        }
                    }
                }
            }
        }
    }))
  }
  
  return (
    <div>
        <span>Substituir arquivo com mesmo nome</span>
        <Switch
            checked={passos[props.index].campos[props.campoIndex].processo_campo_arquivo.substitui_arquivo ? true : false}
            onChange= {setaSubstituiArquivo}
            name= {'nome'}
            color= {props.color ? props.color : "primary"}
        />
    </div>
  );
}
