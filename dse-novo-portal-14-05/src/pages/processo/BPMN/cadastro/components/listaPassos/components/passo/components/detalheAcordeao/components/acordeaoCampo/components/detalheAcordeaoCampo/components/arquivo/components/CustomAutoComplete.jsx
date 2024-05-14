import { TextField, FormControl } from '@material-ui/core';
import { useEffect, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useStyles from '../../../DetalheAcordeaoCampo.style';


/**
 * @param {string} id Id do campo de seleção
 * @param {string} title Campos a serem consultados
 * @param {string} label Etiqueta a ser exibida no campo
 * @param {object[]} dados[] Array de opções a serem exibidas
 * @param {function()} callback Função de callback
**/

export default function CustomAutoComplete(props) {
    const classes = useStyles()

    return (
        <FormControl variant="outlined" className={classes.formControl}>
            <Autocomplete
                multiple
                id={ props.id }
                options={props.dados}
                getOptionLabel={(option) => option.nome || ""}
                onChange={(event,newValue)=>{
                    console.log(newValue)
                    props.callback(newValue[newValue.length - 1])
                }}
                renderInput={(params) => <TextField {...params} label={props.label} variant="outlined" />}
            />
        </FormControl>
    )
}