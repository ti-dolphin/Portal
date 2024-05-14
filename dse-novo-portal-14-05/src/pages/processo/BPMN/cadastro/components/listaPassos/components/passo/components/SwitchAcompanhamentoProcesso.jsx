import React from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../PassoAtom'
import update from 'immutability-helper';

import { Switch } from "@mui/material"

export default function SwitchAcompanhamentoProcesso(props) {
  const [passos,setPassos] = useAtom(Passos)

  const handleChange = (event) => {
    setPassos(update(passos,{
      [props.index]:{
        flag : {
          $set : event.target.checked ? 'Sim' : 'Nao'
        }
      }
    }))
  };

  return (
    <>
        <span>Acompanhar passo no processo</span>
        <Switch
            checked={passos[props.index].flag == 'Sim' ? true : false}
            onChange={handleChange}
            name="SwitchAcompanhamentoProcesso"
            color="primary"
        />
    </>
  );
}
