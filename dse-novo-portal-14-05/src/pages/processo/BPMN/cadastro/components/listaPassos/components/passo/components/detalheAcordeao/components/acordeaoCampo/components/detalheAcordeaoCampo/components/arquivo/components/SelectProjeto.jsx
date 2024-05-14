import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';
import {getProjetos} from '../../../../../../../../../../../../../../models/Projeto'

import {
    FormControl,
    InputLabel,
    Select,
    Autocomplete,
    TextField
} from "@mui/material"

/**
 * 
 * @param {string} estado Estado que o seletor irá atualizar
 * @param {function} callback Função de Callback do seletor
 * @param {array} dados Dados que o seletor deverá listar
 *
 */

export default function SelectProjeto(props) {
    const [passos,setPassos] = useAtom(Passos)
    const [projetos, setProjetos] = useState([])
    const [projetoSelecionado,setProjetoSelecionado] = useState(null)

    useEffect( () => {
        setaProjetos()
    },[])

    useEffect(()=>{
        projetos.map((p) => {
            if(p.id == passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id){
                setProjetoSelecionado(p)
            }
        })

        if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id == -1){
            setProjetoSelecionado(null)
        }
    },[projetos,passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id])

    const setaProjetos = () => {
        getProjetos().then((projetos) => {
            setProjetos(projetos)
        })
    }

    const atualizaLocalSalvamento = (newValue) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            projeto_cadastro_id : {
                                $set : newValue ? newValue.id : -1
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
            <Autocomplete
                value={projetoSelecionado}
                options={projetos}
                getOptionLabel={(option) => option.nome || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event,newValue)=>{
                    atualizaLocalSalvamento(newValue)
                }}
                renderInput={(params) => <TextField {...params} label={'Selecione o Projeto'} variant="outlined" />}
            />
        </FormControl>
    );
}
