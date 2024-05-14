import { useState } from 'react'
import moment from 'moment';
import { TableRow, TableCell, Menu, MenuItem, Tooltip } from '@mui/material';
import Label from '../Label'
import Avatar from '../Avatar'
import Prazo from '../tarefas-processo/Prazo'
import ConfirmAlert from '../ConfirmAlert';
import { excluiProcessoExecucao, getProcessAbaProcessos } from '../../redux/slices/process'
import { useDispatch } from '../../redux/store'
import { GetSession } from '../../session';


export default function CustomTableRow({row}){
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState();
    const [openMenu, setOpenMenu] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const usuario = GetSession("@dse-usuario")

    const goToProcesso = (process) => {
        window.open('/processo/'+process.pid, '_blank'); 
    } 

    const contextMenu = (event) => {
        if(usuario.tipo === "Administrador"){
            event.preventDefault();
            setAnchorEl(event.currentTarget);
            setOpenMenu(true);
        }
    }

    const excluiProcesso = async () => {
        await dispatch(excluiProcessoExecucao(row.pid))
        await dispatch(getProcessAbaProcessos())
        setOpenDelete(false)
    }

    return(
        <>
            <TableRow hover onClick={() => goToProcesso(row)} onContextMenu={contextMenu}>
                <TableCell component="th" scope="row"><Avatar variant='rounded' src={row.avatar} /></TableCell>
                <TableCell >{row.pid}</TableCell>
                <TableCell align="left">{row.title}</TableCell>
                <TableCell align="left">{row.processo}</TableCell>
                <Tooltip title={row.titulo}>
                    <TableCell align="left">
                            {row.titulo.length > 30 ? row.titulo.substring(0, 30) +'...' : row.titulo}
                    </TableCell>
                </Tooltip>
                <TableCell align="left">{row.responsavel}</TableCell>
                <TableCell align="left">{moment(row.data_inicio).format('DD/MM/YYYY')}</TableCell>
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

                <TableCell align="left">
                    {row.data_fim ? 
                        <Label color='success'>Concluído</Label> 
                        :
                        <Label color='info'>Em Andamento</Label> 
                    }
                </TableCell>

            </TableRow>

            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={openMenu}
                onClose={()=>{setAnchorEl(null); setOpenMenu(false)}}
            >
                <MenuItem onClick={()=>{setOpenDelete(true); setOpenMenu(false)}}> Excluir processo permanetemente</MenuItem>
            </Menu>

            <ConfirmAlert open={openDelete} setOpen={setOpenDelete} title='Excluir processo?' subtitle='Deseja excluir permanentemente este processo? (esta ação é irreversível)' callbackConfirm={excluiProcesso} callbackDecline={()=>setOpenDelete(false)}/>

        </>
    )
}