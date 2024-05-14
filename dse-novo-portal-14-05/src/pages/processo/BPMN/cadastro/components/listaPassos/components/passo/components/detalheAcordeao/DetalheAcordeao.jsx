import React from 'react';
import DraggableVerticalList from './components/DraggableVerticalList'

import {useAtom } from "jotai"
import {Passos} from '../../../../PassoAtom'
import update from 'immutability-helper';

import SelectTipoArquivo from './components/SelectTipoArquivo'
import PassoDica from './components/PassoDica'
import FieldEstimativa from './components/FieldEstimativa'


import {
  Grid
} from "@mui/material"

export default function DetalheAcordeao(props) {
  const draggableVerticalListRef = React.createRef();
  const [passos,setPassos] = useAtom(Passos)

  const adicionaCampoLista = (novoCampo) => {
    setPassos(update(passos,{
      [props.index]:{ // id do passo
          campos: { // array de campos
              $push: [
                novoCampo
              ]
          }
      }
    }))
  }

  return (
    <Grid container spacing={2}>
      <Grid item lg={4} md={2} sm={0} xs={0} />

      <Grid item lg={5} md={8} sm={12} xs={12}>
        <PassoDica index={props.index}/>
      </Grid>

      <Grid item lg={4} md={2} sm={0} xs={0} />

      <Grid item lg={5} md={8} sm={12} xs={12}>
        <FieldEstimativa index={props.index}/>
      </Grid>

      <Grid item lg={4} md={2} sm={0} xs={0} />

      <Grid item lg={5} md={8} sm={12} xs={12}>
        <SelectTipoArquivo index={props.index} callback={adicionaCampoLista}/>
      </Grid>

      <Grid item lg={12} md={12} sm={12} xs={12}>
        <DraggableVerticalList index={props.index} ref={draggableVerticalListRef}/>
      </Grid>

    </Grid>
  );
}
