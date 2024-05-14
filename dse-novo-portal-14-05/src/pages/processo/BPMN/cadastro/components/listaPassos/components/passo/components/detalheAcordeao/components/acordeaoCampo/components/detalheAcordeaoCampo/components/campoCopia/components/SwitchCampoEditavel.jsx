import React from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
  Switch,
  Stack,
  Typography
} from "@mui/material"

export default function SwitchCampoEditavel(props) {
  const [passos,setPassos] = useAtom(Passos)

  const handleChange = (event) => {
    // setChecked(event.target.checked)

    setPassos(update(passos,{
      [props.index]:{ // id do passo
          campos: { // array de campos
              [props.campoIndex]: { // id do campo 
                processo_campo_copia: { // vai editar a obrigatoriedade
                    editavel:{
                        $set: event.target.checked ? 1 : 0
                    } 
                  }
              }
          }
      }
    }))

  };


  return (
    <Stack spacing={2} direction='row' alignItems='center'>
        <Typography>Campo Editável</Typography>
        <Switch
            checked={passos[props.index]?.campos[props.campoIndex]?.processo_campo_copia.editavel || false}
            onChange={handleChange}
            name="SwitchCampoEditavel"
            color="primary"
        />
    </Stack>
  );
}
