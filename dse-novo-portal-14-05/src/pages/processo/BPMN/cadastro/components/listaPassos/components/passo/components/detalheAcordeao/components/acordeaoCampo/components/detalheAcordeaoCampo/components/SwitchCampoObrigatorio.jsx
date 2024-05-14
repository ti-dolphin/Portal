import React from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
  Switch
} from "@mui/material"

export default function SwitchCampoObrigatorio(props) {
  const [passos,setPassos] = useAtom(Passos)

  const handleChange = (event) => {
    // setChecked(event.target.checked)

    setPassos(update(passos,{
      [props.index]:{ // id do passo
          campos: { // array de campos
              [props.campoIndex]: { // id do campo 
                obrigatoriedade: { // vai editar a obrigatoriedade 
                      $set: event.target.checked
                  }
              }
          }
      }
    }))

  };


  return (
    <div >
        <span>Preenchimento obrigatório</span>
        <Switch
            checked={passos[props.index]?.campos[props.campoIndex]?.obrigatoriedade || false}
            onChange={handleChange}
            name="SwitchCampoObrigatorio"
            color="primary"
        />
    </div>
  );
}
