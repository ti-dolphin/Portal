import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    TextField,
    Button,
    Grid
  } from "@mui/material"


export default function BasicTextFields(props) {
  const [passos,setPassos] = useAtom(Passos)
  const [descricao, setDescricao] = useState(passos[props.index].campos[props.campoIndex]?.nome || "")

  const editarCampoDescricao = () => {
    setPassos(update(passos,{
        [props.index]:{ // id do passo
            campos: { // array de campos
                [props.campoIndex]: { // id do campo 
                    nome: { // vai editar o nome 
                        $set: descricao // seta a propriedade com o que foi digitado
                    }
                }
            }
        }
    }))

  }

  return (
    <Grid container spacing={3}>
        <Grid item lg={12} md={12} sm={12} xs={12}>
            <TextField 
                value={descricao}
                onBlur={editarCampoDescricao} 
                onChange={(event) => setDescricao(event.target.value)} 
                id="Descrição do campo-basic" 
                label="Descrição do campo" 
                variant="outlined" 
                sx={{width: '100%'}}
            />
        </Grid>

    </Grid>
  );
}