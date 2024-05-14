import { useState, useEffect } from 'react'
import { TableRow, TableCell, Rating, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom'
import Label from './Label'
import Avatar from './Avatar'
import Prazo from './tarefas-processo/Prazo'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';


export default function CustomTableRow({row, callbackRating, acompanhando}){
    const [ rating, setRating ] = useState(row.acompanhando)
    const navigate = useNavigate();
    var labelColor = (row.status === 'Concluído' && 'success') ||
                    (row.status === 'Fazendo' && 'info') ||
                    (row.status === 'Aguardando' && 'warning') ||
                    (row.status === 'Não Concluído' && 'error') ||
                    'default'

    const goToProcesso = (process) => {
        navigate('/processo/'+process.pid);
        document.location.reload(true)
    } 

    useEffect(()=>{
        setRating(row.acompanhando)
    },[row.acompanhando])

    return(
        <TableRow hover onClick={() => goToProcesso(row)}>
            <TableCell component="th" scope="row"><Avatar variant='rounded' src={row.avatar} /></TableCell>
            <TableCell >{row.pid}</TableCell>
            <TableCell align="left">{row.title}</TableCell>
            <TableCell align="left">{row.processo}</TableCell>
            <Tooltip title={row.titulo}>
                <TableCell align="left">
                        {row.titulo.length > 30 ? row.titulo.substring(0, 30) +'...' : row.titulo}
                </TableCell>
            </Tooltip>
            <TableCell align="left">{row.andamento ? row.andamento : '-' }</TableCell>
            <TableCell align="left">{row.tarefa_atual}</TableCell>
            
            <TableCell align="left">
                {row.prazo_tarefa ? 
                    <Prazo prazo={row.prazo_tarefa} />
                    :
                    <Label color='default'>Sem Prazo</Label> 
                }
            </TableCell>
            <TableCell align="left">
                {row.prazo_processo ? 
                    <Prazo prazo={row.prazo_processo} />
                    :
                    <Label color='default'>Sem Prazo</Label> 
                }
            </TableCell>
            {acompanhando &&
                <TableCell align="left">{row.responsavel}</TableCell>
            }
            {row.status &&
                <TableCell align="left">
                    <Label color={labelColor}>{row.status}</Label> 
                </TableCell>
            }
            <TableCell align="left">
                <ChatBubbleOutlineIcon fontSize='small' sx={{ color: (theme) => theme.palette.grey[300] }}/>
            </TableCell>
            <TableCell align="left">
                <Rating max={1}
                    onClick={(e) => e.stopPropagation()}
                    value={rating ? 1 : 0}
                    onChange={(event, newValue) => {
                        if(newValue){
                            setRating(true)
                        }else{
                            setRating(false)
                        }
                        callbackRating(row, newValue)
                    }}
                />
            </TableCell>
        </TableRow>
    )
}