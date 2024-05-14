import React, { useState, useEffect } from 'react';
import {notification} from '../../../../../../../../../../../../../../../../../components/notification/notiflix'
import {cadastraMascara} from '../../../../../../../../../../../../../../models/Mascara'

import {
    Grid,
    Button,
    TextField,
    Alert
} from "@mui/material"

export default function CadastroMascaraPersonalizada(props) {
    const [descricao,setDescricao] = useState('')
    const [mascara,setMascara] = useState('')

    const cadastrarMascara = () => {
        if(mascara.length >= 3){
            cadastraMascara({mascara: mascara,descricao:descricao}).then((r) => {
                props.callback({id:r.rows.insertId,mascara:mascara})
                setDescricao('')
                setMascara('')
            })
        } else{
            notification('warning', 'A máscara deve ter ao menos três caracteres')
        }
    }


    return (
        <Grid container spacing={3} alignItems='center'>
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <Alert severity="info"><b>9</b>: para números, <b>a</b>: para letras, <b>*</b>: para alfanuméricos</Alert>
            </Grid>
            <Grid item lg={4} md={6} sm={12} xs={12}>
                <TextField value={descricao} onChange={(event)=>setDescricao(event.target.value)} style={{width: '100%'}} id="outlined-basic" label="Descrição" variant="outlined" />
            </Grid>

            <Grid item lg={4} md={6} sm={12} xs={12}>
                <TextField value={mascara} onChange={(event)=>setMascara(event.target.value)}style={{width: '100%'}} id="outlined-basic" label="Mascara" variant="outlined" />
            </Grid>

            <Grid item lg={4} md={12} sm={12} xs={12}>
                <Button onClick={() => cadastrarMascara()} variant="contained" color="primary">
                    Cadastrar Mascara
                </Button>
            </Grid>

        </Grid>
    );
}