import * as Yup from 'yup';
import { useEffect, useState } from 'react'
import { Grid, 
    Typography, 
    Box,
    Button,
    IconButton,
    Tooltip,
 } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import CampoForm from './CampoForm'
import {notification} from "../../../../../../components/notification/notiflix";
import {getTituloDinamico, postTituloDinamico} from '../../../models/TituloDinamico'

export default function TituloDinamicoForm({processo_id, setOpen}){

    useEffect(() => {
        getTituloDinamico(processo_id).then((data) => {
            if(data.length > 0){
                setCampos(data)
            }
        })
    },[])

    const [campos, setCampos] = useState([{}])
    const [isLoading, setIsLoading] = useState(false)

    const adicionaCampo = () => {
        setCampos([...campos, {}])
    }

    const callbackCampo = (campo) => {
        const camposAux = campos
        camposAux[campo.index] = campo
        setCampos([...camposAux])
    }

    const removeCampo = (index) => {
        const camposAux = campos
        camposAux.splice(index, 1);
        setCampos([...camposAux])
    }

    const salvar = () => {
        setIsLoading(true)

        const camposAux = campos
        let verify = true
        camposAux.map((campo) => {
            const erroPasso = Object.keys(campo).includes("passoSelecionado")
            const erroCampo = Object.keys(campo).includes("campoSelecionado")

            if(!erroPasso || !erroCampo){
                if(!erroPasso){
                    campo.erroPasso = true
                }
                if(!erroCampo){
                    campo.erroCampo = true
                }
                verify = false
                return campo
            }
        })

        if(verify){
            if(campos.length > 0){
                postTituloDinamico(processo_id, campos).then((result) => {
                    notification('success','Título configurado com sucesso.')
                    setIsLoading(false)
                    setOpen(false)
                })
            } else{
                notification('warning','Selecione ao menos um campo')
                setIsLoading(false)
            }
        } else{
            setCampos([...camposAux])
            setIsLoading(false)
        }

    }

    return(
        <>
            
            <Grid container spacing={2}>

                <Grid item xs={11} >
                    <Typography variant='h4'>Título dinâmico</Typography>
                </Grid>

                <Grid item xs={1} >
                    <Tooltip title="Adicionar campo">
                        <IconButton onClick={() => adicionaCampo()} >
                            <AddIcon/>
                        </IconButton>
                    </Tooltip>
                </Grid>

                <Box mb={2}/>

                {campos.map((campo, index) => (
                    <CampoForm 
                        index={index}
                        passoSelecionado={campo.passoSelecionado ? campo.passoSelecionado : null}
                        erroPasso={campo.erroPasso}
                        campoSelecionado={campo.campoSelecionado ? campo.campoSelecionado : null}
                        erroCampo={campo.erroCampo}
                        callbackCampo={callbackCampo} 
                        removeCampo={removeCampo}
                    />
                ))}

                <Grid item xs={12} >
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                        <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>

                        <Box mr={0.5}/>

                        <LoadingButton type="submit" variant="contained" loading={isLoading} onClick={() => salvar()}>
                            Salvar
                        </LoadingButton>

                    </Box>
                    <Box mb={2}/>    
                </Grid>

            </Grid>
        </>
    )
}