import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';
import {getProjetos} from '../../../../../../../../../../../../../../models/Projeto'
import {getCategoriasPasta} from '../../../../../../../../../../../../../../models/CategoriaAtributo'

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

export default function SelectCategoriaAtributos(props) {
    const [passos,setPassos] = useAtom(Passos)
    const [categorias,setCategorias] = useState([])

    const getCategorias = () => {
        var filha
        if((passos[props.index].campos[props.campoIndex].processo_campo_arquivo.cadastro_nova_pasta_campo_id) ||
           (passos[props.index].campos[props.campoIndex].processo_campo_arquivo.selecao_filha && 
            passos[props.index].campos[props.campoIndex].processo_campo_arquivo.selecao_filha != -1)
           ){
            filha = true // filha é true se a flag de cadatrar em pasta filha ou a flag de criar nova pasta estiverem ativas
           } else{
            filha = false
           }

        getCategoriasPasta(filha,passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id).then((categorias) => {
            setCategorias(categorias)
        })
    }

    useEffect(() => {
        if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id != -1){
            getCategorias()
        } else{
            setCategorias([])
        }
    },[passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_pasta_id,
       passos[props.index].campos[props.campoIndex].processo_campo_arquivo.cadastro_nova_pasta_campo_id,
       passos[props.index].campos[props.campoIndex].processo_campo_arquivo.selecao_filha])

    useEffect(()=>{
        if(categorias.length > 0){
            var verifica = true
            categorias.map((c) => {
                if(c.id == passos[props.index].campos[props.campoIndex].processo_campo_arquivo.categoria_id){
                    verifica = false
                }
            })
    
            if(verifica){
                atualizaCategoriaID({target:{value:0}})
            }
        }
    },[categorias])

    const atualizaCategoriaID = (event) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            categoria_id : {
                                $set: event.target.value
                            }
                        },
                    }
                }
            }
        }))
    }

    return (
        categorias.length > 0 ?
            <FormControl variant="outlined" sx={{width: '100%'}}>

                <InputLabel htmlFor="outlined-Selecione o local de salvamento-native-simple">Selecione a categoria de atributos da pasta</InputLabel>

                <Select
                    native
                    value={passos[props.index].campos[props.campoIndex].processo_campo_arquivo.categoria_id}
                    onChange={atualizaCategoriaID}
                    label="Selecione a categoria de atributos da pasta"
                    inputProps={{
                        name: 'Selecione a categoria de atributos da pasta',
                        id: 'outlined-Selecione a categoria de atributos da pasta-native-simple',
                    }}
                >
                    <option value="0">Sem Categoria</option>
                    {categorias.map((c) => (
                        <option value={c.id}>{c.categoria}</option>
                    ))}
                </Select>
            </FormControl>
        : null
    );
}
