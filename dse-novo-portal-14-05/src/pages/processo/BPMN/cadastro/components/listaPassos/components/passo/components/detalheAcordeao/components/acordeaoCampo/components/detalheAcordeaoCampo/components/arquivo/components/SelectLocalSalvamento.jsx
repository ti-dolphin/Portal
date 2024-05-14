import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    FormControl,
    InputLabel,
    Select
} from "@mui/material"
/**
 * 
 * @param {string} estado Estado que o seletor irá atualizar
 * @param {function} callback Função de Callback do seletor
 * @param {array} dados Dados que o seletor deverá listar
 *
 */

export default function SelectLocalSalvamento(props) {
    const [passos,setPassos] = useAtom(Passos)

    const atualizaLocalSalvamento = (event) => {
        props.setLocalSalvamento(event.target.value)
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            projeto_cadastro_id : {
                                $set : event.target.value === 'Template' ? 0 : -1
                            },
                            projeto_pasta_id : {
                                $set : -1
                            }
                        }
                    }
                }
            }
        }))

    }

    return (
        <FormControl variant="outlined" sx={{width: '100%'}}>
                <InputLabel htmlFor="outlined-Selecione o local de salvamento-native-simple">Selecione o local de salvamento</InputLabel>

                <Select
                    native
                    // value={    
                    //     passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id ? 
                    //     passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id == 0 ? 
                    //     'Template' : 'Pasta específica de projeto'
                    //     : 'Template'
                    // }
                    value={(props.localSalvamento == 'Template' || props.localSalvamento == 'template') ? 'Template' : 'Pasta específica de projeto'}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={atualizaLocalSalvamento}
                    label="Selecione o local de salvamento"
                    inputProps={{
                        name: 'Selecione o local de salvamento',
                        id: 'outlined-Selecione o local de salvamento-native-simple',
                    }}
                >
                    <option aria-label="None" value="" />
                    <option>Template</option>
                    <option>Pasta específica de projeto</option>
                </Select>
            </FormControl>
    );
}
