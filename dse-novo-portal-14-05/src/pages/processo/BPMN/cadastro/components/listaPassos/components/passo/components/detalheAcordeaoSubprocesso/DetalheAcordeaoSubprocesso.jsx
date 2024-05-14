import { useEffect, useState } from 'react';

import {
    MenuItem,
    TextField,
    Grid,
    Switch
  } from "@mui/material"

import {useAtom } from "jotai"
import {Passos} from '../../../../PassoAtom'
import { api } from '../../../../../../../../../../config.ts'
import update from 'immutability-helper';

export default function DetalheAcordeaoSubprocesso(props) {
    const [passos,setPassos] = useAtom(Passos)
    const [processos, setProcessos] = useState([])
    const [selecionado,setSelecionado] = useState('')

    useEffect(()=>{
        setaOpInicio()
    },[])

    useEffect(()=>{
        if(processos.length > 0 && passos[props.index].subprocesso_cadastro_id && passos[props.index].subprocesso_cadastro_id != 0){
            processos.map((ps) => {
                if(ps.id === passos[props.index].subprocesso_cadastro_id){
                    setSelecionado(ps)
                    handleChange({
                        target: {
                            value: ps
                        }
                    })
                }
            })
        }
    },[processos])

    const setaOpInicio = () => {
        api.get('processo-cadastro?target[]=status&target_value[]=Ativo').then((p) => {
            setProcessos(p.data)
        })
    }

    const handleChange = (e) => {
        setSelecionado(e.target.value)
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                subprocesso_cadastro_id: { 
                    $set: e.target.value.id 
                },
                nome: {
                    $set: e.target.value.nome ? 'Sub-Processo: '+e.target.value.nome : 'Sub-Processo'
                }
            }
        }))
    }

    const handleChangeBloqueante = (e) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                bloqueante: { 
                    $set: e.target.checked
                },
            }
        }))
    }

    return (
        <Grid container spacing={2}>

            <Grid item lg={4} md={4} sm={4} xs={0} />

            <Grid item lg={4} md={4} sm={4} xs={12}>
                <span>Sub-Processo bloqueante</span>
                <Switch
                    checked={passos[props.index]?.bloqueante || false}
                    onChange={handleChangeBloqueante}
                    name="SwitchPassoBloqueante"
                    color="primary"
                />
            </Grid>

            <Grid item lg={4} md={4} sm={4} xs={0} />

            <Grid item lg={4} md={4} sm={4} xs={0} />

            <Grid item lg={4} md={4} sm={4} xs={12}>
                <TextField
                    fullWidth
                    label='Selecione o Processo'
                    select
                    value={selecionado}
                    onChange={handleChange}
                >
                    <MenuItem value=''></MenuItem>
                    {processos.map((p) => (
                        <MenuItem key={"option_processo_"+p.id} value={p}>{p.nome}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            <Grid item lg={4} md={4} sm={4} xs={0} />
        </Grid>
    )
}