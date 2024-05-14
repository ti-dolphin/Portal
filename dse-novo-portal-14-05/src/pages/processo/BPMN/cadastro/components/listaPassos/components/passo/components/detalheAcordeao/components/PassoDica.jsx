import React, { useState, useEffect } from 'react';
import {useAtom } from "jotai"
import {Passos} from '../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    Grid,
    TextField
} from "@mui/material"

export default function PassoDica(props) {
    
    const [passos,setPassos] = useAtom(Passos)
    const [valor, setValor] = useState(passos[props.index].dica)

    const handleChange = (e) => {
        setValor(e.target.value)
    }

    const editaDica = () => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                dica: { // array de campos
                    $set: valor
                }
            }
        }))
    }

    return (
        <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <TextField
                    id="outlined-Dica para preenchimento do passo-static"
                    label="Dica para preenchimento do passo"
                    multiline
                    value={valor}
                    onChange={handleChange}
                    onBlur={editaDica} 
                    rows={4}
                    variant="outlined"
                    style={{width: '100%',marginBottom:'16px'}}
                />
            </Grid>
        </Grid>
    );
}