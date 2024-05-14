import { useState } from 'react';
import { TableRow, TableCell, Button, Stack, Tooltip, ClickAwayListener } from '@mui/material'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SelectResponsavel from '../SelectResponsavel'
import { verifyPermission } from "../../redux/slices/step"
import { useDispatch } from '../../redux/store'
import Label from '../Label'
import Prazo from './Prazo'
import moment from 'moment';

export default function CustomTableRow({ row, callback }){
    moment.locale('pt-br');
    const [openTooltip, setOpenTooltip] = useState(false);
    const Dateformat = "DD/MM/YYYY-HH:mm"
    const dispatch = useDispatch()
    
    const beforeCallback = async (row) => {
        if(await dispatch(verifyPermission(row.id))){
            callback(row)
        } else{
            handleTooltipOpen()
        }
    }

    const handleTooltipClose = () => {
        setOpenTooltip(false);
    };
    
    const handleTooltipOpen = () => {
        setOpenTooltip(true);
    };

    var inative = row.inativa;

    var buttonColor = (row.status === 'Concluído' && 'success') ||
                      (row.status === 'Fazendo' && 'info') ||
                      (row.status === 'Aguardando' && 'warning') ||
                      (row.status === 'Não Concluído' && 'error') ||
                      'inherit'
    
    var rowColor = (row.status === 'Aguardando' && 'warning') ||
                   (row.status === 'Não Concluído' && 'error') ||
                   null 
                    

    var buttonIcon = (row.status === 'Concluído' && <CheckIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[0]}}/>) ||
                     (row.status === 'Fazendo' && <PlayArrowIcon fontSize='smaller'/>) ||
                     (row.status === 'Aguardando' && <AccessTimeFilledIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[0]}}/>) ||
                     (row.status === 'Não Concluído' && <CloseIcon fontSize='smaller'/>) ||
                     <FiberManualRecordIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[300]}}/>

    return(
        <ClickAwayListener onClickAway={() => handleTooltipClose()}>
            <Tooltip 
                onClose={handleTooltipClose}
                open={openTooltip}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Você não tem permissão para executar esta tarefa."
            >
                <TableRow hover={!inative} onClick={() => !inative && beforeCallback(row)} sx={{borderBottom:0.1, borderBottomColor: (theme) => theme.palette.grey[300], backgroundColor: inative ? (theme) => theme.palette.grey[100] : rowColor ? (theme) => theme.palette[rowColor].lighter : (theme) => theme.palette.grey[0] }}>
                    
                    <TableCell width='10px'>
                        {inative ? 
                            <LockOutlinedIcon sx={{color: (theme) => theme.palette.grey[400]}} />
                            :
                            <Button sx={{maxWidth:18, minWidth:18, height:18, borderRadius:0.5, boxShadow: 'none'}}variant='contained' color={buttonColor} size='small'>
                                {buttonIcon}
                            </Button>
                        } 
                    </TableCell>

                    <TableCell sx={{color: inative ? (theme) => theme.palette.grey[500] : (theme) => theme.palette.grey[900]}}>{row.nome}</TableCell>

                    <TableCell>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <SelectResponsavel passo={row} inative={inative}/>
                        </Stack>
                    </TableCell>

                    <TableCell>
                        {row.prazo ? 
                            <Prazo prazo={row.prazo} />
                            :
                            row.estimativa ? 
                                <Label color='success'>
                                    {row.estimativa} Horas
                                </Label>
                                :
                                '-'
                        }
                    </TableCell>

                    <TableCell>
                        {row.data_conclusao ? moment(row.data_conclusao).locale('pt-br').format(Dateformat) : '-'}
                    </TableCell>

                    <TableCell>
                        <ChatBubbleOutlineIcon fontSize='small' sx={{color:row.comentario_novo ? (theme) => theme.palette.success.dark : (theme) => theme.palette.grey[400]}}/>
                    </TableCell>

                </TableRow>
            </Tooltip>
        </ClickAwayListener>
    )
}