import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';
import SelectLocalSalvamento from './components/SelectLocalSalvamento'
import SelectProjeto from './components/SelectProjeto'
import SelectTemplate from './components/SelectTemplate'
import SelectPasta from './components/SelectPasta'
import SelectCampoPasso from './components/SelectCampoPasso';
import SelectCategoriaAtributos from './components/SelectCategoriaAtributos';
import SwitchConversaoPDF from './components/SwitchConversaoPDF'
import SwitchSubstituiArquivo from './components/SwitchSubstituiArquivo'
import SwitchSelecaoPastaFilha from './components/SwitchSelecaoPastaFilha';
import SwitchCadastrarNovaPastaCampoAnterior from './components/SwitchCadastrarNovaPastaCampoAnterior';
import SwitchSelecaoArquivoGED from './components/SwitchSelecaoArquivoGED'
import {getProjeto} from '../../../../../../../../../../../../../models/Projeto'

import {
    Grid
} from "@mui/material"

export default function DetalheAcordeaoCampo(props) {
    const [passos,setPassos] = useAtom(Passos)
    const [localSalvamento,setLocalSalvamento] = useState('')

    useEffect(()=>{
        getProjeto(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id).then((projeto) => {
            if(projeto && projeto.template){
                if(projeto.template == 1 || projeto.template == '1'){
                    setLocalSalvamento('Template')
                } else{
                    setLocalSalvamento('pasta')
                }
            }
        })
    },[])

    const verificaLocalSalvamento = () => {
        // if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id){
        //     if(passos[props.index].campos[props.campoIndex].processo_campo_arquivo.projeto_cadastro_id != 0){
        //         return 'pasta'
        //     } else{
        //         return 'template'
        //     }
        // } else{
        //     return 'template'
        // }

        if(localSalvamento == 'template' || localSalvamento == 'Template'){
            return 'template'
        } else{
            return 'pasta'
        }
    }

    const callbackCampoPasso = (campoPasso) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            cadastro_nova_pasta_campo_id : {
                                $set: campoPasso.campoId
                            }
                        },
                    }
                }
            }
        }))
    }

    const resetaValueCampoPasso = () => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_arquivo : {
                            cadastro_nova_pasta_campo_id : {
                                $set: -1
                            }
                        },
                    }
                }
            }
        }))
    }

    return (
        <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SelectLocalSalvamento localSalvamento={localSalvamento} setLocalSalvamento={setLocalSalvamento} index={props.index} campoIndex={props.campoIndex}/>
            </Grid>

            {verificaLocalSalvamento() === 'pasta' ?
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SelectProjeto index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            :     
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SelectTemplate index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            }

            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SelectPasta index={props.index} campoIndex={props.campoIndex} />
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SwitchConversaoPDF index={props.index} campoIndex={props.campoIndex}/>
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SwitchSubstituiArquivo index={props.index} campoIndex={props.campoIndex}/>
            </Grid>

            {verificaLocalSalvamento() === 'pasta' ?
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SwitchSelecaoPastaFilha index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            : null}

            {/* {verificaLocalSalvamento() === 'pasta' ? */}
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SwitchCadastrarNovaPastaCampoAnterior index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            {/* : null} */}

            {/* {verificaLocalSalvamento() === 'pasta' ? */}
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SwitchSelecaoArquivoGED index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            {/* : null} */}

            {passos[props.index].campos[props.campoIndex].processo_campo_arquivo.cadastro_nova_pasta_campo_id ?
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SelectCampoPasso
                        valorInicial={passos[props.index].campos[props.campoIndex].processo_campo_arquivo.cadastro_nova_pasta_campo_id}
                        reset={resetaValueCampoPasso}
                        callback={callbackCampoPasso}
                    />
                </Grid>
            : null}

            {/* {verificaLocalSalvamento() === 'pasta' ? */}
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <SelectCategoriaAtributos index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            {/* : null} */}


        </Grid>
    );
}
