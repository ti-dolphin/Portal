import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';
import {getPastasPaiProjeto,getPastasFilhas,getCaminhoPastaProjeto} from '../../../../../../../../../../../../../../models/ProjetoPasta'
import {getPastasPaiTemplate,getPastasTemplateFilhas,getCaminhoPastaTemplate} from '../../../../../../../../../../../../../../models/Template'

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
    const [pastas, setPastas] = useState([])
    const [pastaSelecionada,setPastaSelecionada] = useState([])

    const verificaLocalSalvamento = () => {
        if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id){
            if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id != 0){
                return 'pasta'
            } else{
                return 'template'
            }
        } else{
            return 'template'
        }
    }

    useEffect(() => {
        setaPastas()
    },[passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id,
    passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id])

    useEffect(() => {
        setaPastaSelecionada()
    },[pastas])

    const setaPastas = () => {
        if(verificaLocalSalvamento() === 'pasta'){
            if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id != -1){

                if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id 
                && passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id != -1){
                    getPastasFilhas(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id).then((PastasResult) => {
                        setPastas(PastasResult)
                    })

                } else{
                    getPastasPaiProjeto(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id).then((PastasResult)=>{
                        setPastas(PastasResult)
                    })
                }

            } else{
                setPastas([])
            }
        } else{
            if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id 
            && passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id != -1){
                getPastasTemplateFilhas(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id).then((PastasResult) => {
                    setPastas(PastasResult)
                })

            } else{
                getPastasPaiTemplate().then((PastasResult) => {
                    setPastas(PastasResult)
                })
                
            }

        }
    }

    const setaPastaSelecionada = () => {

        if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id && passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id != -1){
            if(verificaLocalSalvamento() === 'pasta'){
                getCaminhoPastaProjeto(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id).then((result)=>{
                    setPastaSelecionada(result)
                })
            } else{
                getCaminhoPastaTemplate(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id).then((result)=>{
                    setPastaSelecionada(result)
                })
            }
        } else{
            setPastaSelecionada([])
        }

    }

    const atualizaPastaSelecionada = (newValue) => {
        var ultimo = newValue[newValue.length - 1]

        setaProjetoPastaID(ultimo ? ultimo.id : -1)
    }

    const setaProjetoPastaID = (id) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            projeto_pasta_id : {
                                $set : id
                            },
                            categoria_id : {
                                $set : 0
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
                multiple
                value={pastaSelecionada}
                options={pastas}
                getOptionLabel={(option) => option.nome || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event,newValue) => {
                    atualizaPastaSelecionada(newValue)
                }}
                renderInput={(params) => <TextField {...params} label={'Selecione a Pasta'} variant="outlined" />}
            />
        </FormControl>
    );
}
