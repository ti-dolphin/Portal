import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {notification} from '../../../../../../../../../../../../../../../../components/notification/notiflix'
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    TextField,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from "@mui/material"

export default function SelecaoPersonalizada(props) {

    const [passos,setPassos] = useAtom(Passos)
    const [label,setLabel] = useState('')
    const [value,setValue] = useState('')

    // useEffect(()=>{
    //     console.log(passos[props.index].campos[props.campoIndex].processo_campo_opcao_select)
    // },[])

    const AdicionaOpcao = () => {
        if(label && value){

            var opcao = {
                label: label,
                value: value,
                processo_cadastro_id: passos[props.index].processo_cadastro_id,
                processo_campo_cadastro_id : passos[props.index].campos[props.campoIndex].id
            }

            if(verificaSeOpcaoJaExiste(opcao)){
                setPassos(update(passos,{
                    [props.index]:{ // id do passo
                        campos: { // array de campos
                            [props.campoIndex]: { // id do campo 
                                processo_campo_opcao_select: { 
                                    $push : [opcao]
                                }
                            }
                        }
                    }
                }))

                setLabel('')
                setValue('')
            } else{
                notification('warning','A label ou valor inseridos correspondem a uma opção já existente, as opções devem ser únicas.')
            }
        } else{
            notification('warning','É necessário preencher a label e o valor para adicionar uma opção.')
        }
    }

    const verificaSeOpcaoJaExiste = (opcao) => {
        var retorno = true
        passos[props.index].campos[props.campoIndex].processo_campo_opcao_select.map((op) => {
            if(op.label == opcao.label || op.value == opcao.value){
                retorno = false
            }
        })

        return retorno
    }

    const removeOpcao = (opcao,index) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_opcao_select: { 
                            $splice: [[index, 1]] 
                        }
                    }
                }
            }
        }))
    }

    return (
        <Grid container spacing={3} alignItems="center">
            <Grid item lg={4} md={6} sm={12} xs={12}>
                <TextField value={label} onChange={(event)=>setLabel(event.target.value)} style={{width: '100%'}} id="outlined-basic" label="Label" variant="outlined" />
            </Grid>

            <Grid item lg={4} md={6} sm={12} xs={12}>
                <TextField value={value} onChange={(event)=>setValue(event.target.value)} style={{width: '100%'}} id="outlined-basic" label="Valor" variant="outlined" />
            </Grid>

            <Grid item lg={4} md={6} sm={12} xs={12}>
                <Button onClick={() => AdicionaOpcao()} variant="contained" color="primary">
                    Adicionar
                </Button>            
            </Grid>

            <Grid item lg={12} md={12} sm={12} xs={12}>
                <TableContainer component={Paper}>
                    <Table aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Label</TableCell>
                                <TableCell align="right">Valor</TableCell>
                                <TableCell align="right">Excluir</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {passos[props.index].campos[props.campoIndex].processo_campo_opcao_select.map((row,index) => (
                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">
                                        {row.label}
                                    </TableCell>
                                    <TableCell align="right">{row.value}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={()=>removeOpcao(row,index)} aria-label="delete" >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}
