import React, { useState, useEffect } from 'react';
import {useAtom } from "jotai"
import {Passos} from '../../../../../PassoAtom'
import update from 'immutability-helper';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import {
    Grid,
    TextField,
    InputAdornment,
} from "@mui/material"

export default function FieldEstimativa(props) {
    
    
    const [passos,setPassos] = useAtom(Passos)
    const [valor, setValor] = useState(passos[props.index].estimativa)
    const handleChange = (e) => {
        setValor(e.target.value)
    }

    const editaEstimativa = () => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                estimativa: { // array de campos
                    $set: valor
                }
            }
        }))
    }

    return (
        <Grid container spacing={3}>
            <Grid item lg={6} md={6} sm={6} xs={12}>
                <TextField
                    id="outlined-FieldEstimativa-static"
                    label="Estimativa em horas"
                    value={valor}
                    onChange={handleChange}
                    onBlur={editaEstimativa} 
                    variant="outlined"
                    type='number'
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccessTimeIcon />
                            </InputAdornment>
                        ),
                        endAdornment:'Horas'
                    }}
                    style={{width: '100%',marginBottom:'16px'}}
                />
            </Grid>
        </Grid>
    );
}