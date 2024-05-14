import { useState } from 'react';
import { Typography, Stack, Box, Card, CardContent, CardActionArea, Button, Tooltip, ClickAwayListener } from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Label from '../Label'
import SelectResponsavel from '../SelectResponsavel'
import Prazo from './Prazo'
import { verifyPermission } from "../../redux/slices/step"
import { useDispatch } from '../../redux/store'

export default function TarefaCard({tarefa, callback}){
    const [openTooltip, setOpenTooltip] = useState(false);
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

    var inative = tarefa.inativa;

    var buttonColor = (tarefa.status === 'Concluído' && 'success') ||
                        (tarefa.status === 'Fazendo' && 'info') ||
                        (tarefa.status === 'Aguardando' && 'warning') ||
                        (tarefa.status === 'Não Concluído' && 'error') ||
                        'inherit'

    var cardColor = (tarefa.status === 'Aguardando' && 'warning') ||
                   (tarefa.status === 'Não Concluído' && 'error') ||
                   null 

    var buttonIcon = (tarefa.status === 'Concluído' && <CheckIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[0]}}/>) ||
                       (tarefa.status === 'Fazendo' && <PlayArrowIcon fontSize='smaller'/>) ||
                       (tarefa.status === 'Aguardando' && <AccessTimeFilledIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[0]}}/>) ||
                       (tarefa.status === 'Não Concluído' && <CloseIcon fontSize='smaller'/>) ||
                       <FiberManualRecordIcon fontSize='smaller' sx={{color: (theme) => theme.palette.grey[300]}}/>

    return (
        <ClickAwayListener onClickAway={() => handleTooltipClose()}>
            <Tooltip 
                onClose={handleTooltipClose}
                open={openTooltip}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Você não tem permissão para executar esta tarefa."
            >
                <Card sx={{backgroundColor: inative ? (theme) => theme.palette.grey[200] : cardColor ? (theme) => theme.palette[cardColor].lighter : (theme) => theme.palette.grey[0], boxShadow: (theme) => theme.shadows[10]}}>
                    <CardActionArea onClick={() => !inative && beforeCallback(tarefa)}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction='row' alignItems='center' spacing={1}>

                                    {inative ? 
                                        <LockOutlinedIcon sx={{color: (theme) => theme.palette.grey[400]}} />
                                        :
                                        <Button sx={{maxWidth:18, minWidth:18, height:18, borderRadius:0.5, boxShadow: 'none'}} variant='contained' color={buttonColor} size='small'>
                                            {buttonIcon}
                                        </Button>
                                    }
                                    
                                    <Typography variant='subtitle1'>
                                        {tarefa.nome}
                                    </Typography>
                                </Stack>

                            
                                <Stack spacing={1} direction='row'>
                                    {tarefa.prazo ? 
                                        <Prazo prazo={tarefa.prazo} icon/>
                                        :
                                        tarefa.estimativa ? 
                                            <Label color='success'>
                                                {tarefa.estimativa} Horas
                                            </Label>
                                            :
                                            <Label color='default'>
                                                Sem Estimativa
                                            </Label>
                                    }
                                    <Box flexGrow={1}/>
                                </Stack>
                                

                                <Stack direction='row' alignItems='center' spacing={1}>

                                    <SelectResponsavel passo={tarefa} inative={inative}/>

                                    <Box flexGrow={1}/>

                                    
                                    <ChatBubbleOutlineIcon fontSize='small' sx={{color:tarefa.comentario_novo ? (theme) => theme.palette.success.dark : (theme) => theme.palette.grey[400]}}/>
                                    
                                </Stack>

                            </Stack>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Tooltip>
        </ClickAwayListener>
    )
}