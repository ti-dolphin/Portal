import React, { useState, useEffect } from 'react';
import SwitchCampoObrigatorio from './components/SwitchCampoObrigatorio';
import InputCampoDescricao from './components/InputCampoDescricao'
import SelecaoPersonalizada from './components/selecaoPersonalizada/SelecaoPersonalizada'
import MascaraPersonalizada from './components/mascaraPersonalizada/MascaraPersonalizada'
import CampoCopia from './components/campoCopia/CampoCopia'
import Arquivo from './components/arquivo/Arquivo';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../PassoAtom'

import {
    Grid,
    Button
} from "@mui/material"

export default function DetalheAcordeaoCampo(props) {
    const [passos,setPassos] = useAtom(Passos)

    const SwitchCampoAvancado = () => {
        var retorno
        switch (passos[props.index]?.campos[props.campoIndex]?.tipo) {
            case "Seleção":
                retorno = <Grid item lg={4} md={6} sm={6} xs={12} >
                            <SelecaoPersonalizada index={props.index} campoIndex={props.campoIndex}/>
                          </Grid>
                break;

            case "Texto com máscara personalizada":
                retorno = <Grid item lg={4} md={6} sm={6} xs={12} >
                            <MascaraPersonalizada index={props.index} campoIndex={props.campoIndex}/>
                          </Grid>
                break;

            case "Arquivo":
                retorno = <Grid item lg={4} md={6} sm={6} xs={12} >
                            <Arquivo index={props.index} campoIndex={props.campoIndex}/>
                          </Grid>
                break;
            
            case "Campo Cópia":
                retorno = <Grid item lg={4} md={6} sm={6} xs={12} >
                            <CampoCopia index={props.index} campoIndex={props.campoIndex}/>
                          </Grid>
                break;
        
            default:
                retorno = null
                break;
        }

        return retorno
    }

    return (
        <Grid container spacing={2}>
            <Grid item lg={4} md={2} sm={2} xs={0} />
                <Grid item lg={4} md={6} sm={6} xs={12}>
                    <SwitchCampoObrigatorio index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            <Grid item lg={4} md={4} sm={4} xs={0} />

            <Grid item lg={4} md={2} sm={2} xs={0} />
                <Grid item lg={4} md={6} sm={6} xs={12}>
                    <InputCampoDescricao index={props.index} campoIndex={props.campoIndex}/>
                </Grid>
            <Grid item lg={4} md={4} sm={4} xs={0} />

            <Grid item lg={4} md={2} sm={2} xs={0} />
                {SwitchCampoAvancado()}
            <Grid item lg={4} md={4} sm={4} xs={0} />

        </Grid>
    );
}
