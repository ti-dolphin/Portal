import { useEffect, useState } from 'react'

import { Grid, 
    TextField,
    IconButton,
    MenuItem,
    Tooltip
 } from '@mui/material';
import { useAtom } from "jotai"
import {Passos} from '../listaPassos/PassoAtom'
import CloseIcon from '@mui/icons-material/Close';

export default function CampoForm({index, passoSelecionado, erroPasso, campoSelecionado, erroCampo, callbackCampo, removeCampo}){

    const [passos, setPassos] = useAtom(Passos)
    const [opcoesPassos, setOpcoesPassos] = useState([])
    const [opcoesCampos, setOpcoesCampos] = useState([]);

    useEffect(()=>{
        setaOpInicio()
    },[passos])

    useEffect(()=>{
        if(passoSelecionado){
            setaOpcoesCampos()
        } else{
            setOpcoesCampos([])
        }
    },[passoSelecionado])

    const setaOpInicio = () =>{
        var opPassos = [];
        passos.map((p) => {
          if(p.decisao != 'sim'){
            opPassos.push(p);
          }
        })
        setOpcoesPassos(opPassos);
    }

    const setaOpcoesCampos = () => {
        var op = [];
        passos.map((p) => {
            if(p.id === passoSelecionado){
                p.campos.map((campo) => {
                    if(campo.tipo !== 'Campo Cópia' && campo.tipo !== 'Arquivo'){
                        op.push(campo)
                    }
                })
            }
        })
        setOpcoesCampos(op);
    }

    const handleChangePasso = (newValue) => {
        if(newValue && newValue !== ''){
            callbackCampo({
                index: index,
                passoSelecionado: newValue,
            })
        } else{
            callbackCampo({
                index: index
            })
        }
    }

    const handleChangeCampo = (newValue) => {
        if(newValue && newValue !== ''){
            callbackCampo({
                index: index,
                passoSelecionado: passoSelecionado,
                campoSelecionado: newValue
            })
        } else{
            callbackCampo({
                index: index,
                passoSelecionado: passoSelecionado
            })
        }
    }
    
    return(
        <>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label='Selecione o Passo'
                    select
                    value={passoSelecionado}
                    onChange={(e) => {
                        handleChangePasso(e.target.value);
                    }}
                    InputLabelProps={{
                        shrink: passoSelecionado ? true : false 
                    }}
                    error={erroPasso}
                    helperText={erroPasso ? 'Preencha este campo' : null}
                >
                    <MenuItem value=''></MenuItem>
                        {opcoesPassos.map((option) =>
                            <MenuItem value={option.id}>
                                {option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}
                            </MenuItem>  
                        )}  
                </TextField>
            </Grid>

            <Grid item xs={11} md={5}>
                <TextField
                    fullWidth
                    label='Selecione o Campo'
                    select
                    value={campoSelecionado}
                    onChange={(e) => {
                        handleChangeCampo(e.target.value);
                    }}
                    InputLabelProps={{
                        shrink: campoSelecionado ? true : false 
                    }}
                    error={erroCampo}
                    helperText={erroCampo ? 'Preencha este campo' : null}
                >
                    <MenuItem value=''></MenuItem>
                    {opcoesCampos.map((option) =>
                        <MenuItem value={option.id}>{option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}</MenuItem>  
                    )}  
                </TextField>
            </Grid>

            <Grid item xs={1}>
                <Tooltip title="Excluir campo">
                    <IconButton onClick={()=>removeCampo(index)} >
                        <CloseIcon/>
                    </IconButton>
                </Tooltip>
            </Grid>
        </>
    )
}