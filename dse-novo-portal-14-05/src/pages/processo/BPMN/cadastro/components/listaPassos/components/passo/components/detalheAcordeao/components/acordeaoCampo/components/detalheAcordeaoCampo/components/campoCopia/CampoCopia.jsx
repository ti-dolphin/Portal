import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {notification} from '../../../../../../../../../../../../../../../../components/notification/notiflix'
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';
import SelectCampoPasso from './components/SelectCampoPasso';
import SwitchCampoEditavel from './components/SwitchCampoEditavel';

import {
    Grid,
} from "@mui/material"

export default function CampoCopia(props) {

    const [passos,setPassos] = useAtom(Passos)

    // useEffect(()=>{
    //     console.log(passos[props.index].campos[props.campoIndex].processo_campo_opcao_select)
    // },[])


    const callbackCampoPasso = (campoPasso) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_copia : {
                            processo_campo_copia_id:{
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
                        processo_campo_copia : {
                            processo_campo_copia_id : {
                                $set: -1
                            },
                        }
                    }
                }
            }
        }))
    }

    return (
        <Grid container spacing={3} alignItems="center">
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SelectCampoPasso
                    passoIndex = {props.index}
                    valorInicial={passos[props.index].campos[props.campoIndex].processo_campo_copia.processo_campo_copia_id}
                    reset={resetaValueCampoPasso}
                    callback={callbackCampoPasso}
                />
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <SwitchCampoEditavel index={props.index} campoIndex={props.campoIndex}/>
            </Grid>
        </Grid>
    );
}
