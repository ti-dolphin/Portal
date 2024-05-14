
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import {notification} from '../notification/notiflix'

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

export default function ConfigureAttributeSelect({configSelect, setConfigSelect}) {

    const [label,setLabel] = useState('')
    const [value,setValue] = useState('')

    const AdicionaOpcao = () => {
        if(label && value){

            var opcao = {
                label: label,
                value: value
            }

            if(verificaSeOpcaoJaExiste(opcao)){
                setConfigSelect([...configSelect, opcao])

                notification('success','Opção inserida com sucesso.')
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
        configSelect.map((op) => {
            if(op.label == opcao.label || op.value == opcao.value){
                retorno = false
            }
        })

        return retorno
    }

    const removeOpcao = (index) => {
        setConfigSelect(configSelect.filter((op, i) => i !== index))
        notification('success','Opção removida com sucesso.')
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
                            {configSelect.map((row,index) => (
                                <TableRow key={row.label}>
                                    <TableCell component="th" scope="row">
                                        {row.label}
                                    </TableCell>
                                    <TableCell align="right">{row.value}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={()=>removeOpcao(index)} aria-label="delete" >
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
