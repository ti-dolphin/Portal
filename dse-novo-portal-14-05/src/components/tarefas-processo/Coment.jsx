import { useState } from 'react';
import { Typography, Stack, TextField } from '@mui/material';
import { GetSession } from '../../session';
import { useDispatch } from '../../redux/store'
import { editPassoComent, deletePassoComent, getPassoComents } from '../../redux/slices/step'
import moment from 'moment';
import MAvatar from '../MAvatar'
import createAvatar from '../../utils/createAvatar'
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import { notification } from '../notification/notiflix'
import ConfirmAlert from '../ConfirmAlert';

export default function Coment({ tarefa, comentario, index }){
    const dispatch = useDispatch();
    const usuario = GetSession('@dse-usuario');
    const [edit, setEdit] = useState(false)
    const nome = comentario.usuario_nome.split(' ');
    const [openDelete, setOpenDelete] = useState(false);

    const editComent = async (e) => {
        if(e.keyCode == 13){
            if (!e.shiftKey){
                e.preventDefault();
                await dispatch(editPassoComent(
                    {
                        id: comentario.id,
                        processo_passo_id: tarefa.id,
                        usuario_id: usuario.id,
                        processo_id: tarefa.processo_id,
                        comentario: e.target.value,
                    }
                    ))
                e.target.value = ''
                await dispatch(getPassoComents(tarefa.id))
                setEdit(false)
                notification('success', 'Comentário alterado com sucesso!') 
            }
            
        }
    }

    const deleteComent = async () => {
        await dispatch(deletePassoComent(comentario.id))
        await dispatch(getPassoComents(tarefa.id))
        setOpenDelete(false)
        notification('success', 'Comentário excluído com sucesso!') 
    }

    return (
        <Stack key={'PassoComentario_'+index} direction='row' spacing={2}>
            <MAvatar
                src={comentario.usuario_nome?.photoURL}
                alt={comentario.usuario_nome?.nome}
                color={comentario.usuario_nome?.photoURL ? 'default' : createAvatar(comentario.usuario_nome).color}
                sx={{ width: 32, height: 32 }}
            >
                {createAvatar(comentario.usuario_nome).name}
            </MAvatar>

            <Stack spacing={1} sx={{width: '100%'}}>
                <Stack direction='row' spacing={2} alignItems='center'>
                    <Typography variant='subtitle2'>
                        {nome.shift()} {nome.length > 1 ? nome.pop() : ''}
                    </Typography>

                    <Typography variant='caption' sx={{color: (theme) => theme.palette.grey[500]}}>
                        {moment(comentario.data).format("DD/MM/YYYY-HH:mm")}
                    </Typography>

                    {comentario.usuario_id === usuario.id &&
                        <>
                            <Tooltip title="Editar comentário">
                                <IconButton size="small" onClick={() => setEdit(true)}>
                                    <EditIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Excluir comentário">
                                <IconButton size="small" onClick={() => setOpenDelete(true)}>
                                    <DeleteIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip>

                            {edit &&
                                <Tooltip title="Cancelar edição">
                                    <IconButton size="small" onClick={() => setEdit(false)}>
                                        <CloseIcon fontSize="inherit"/>
                                    </IconButton>
                                </Tooltip>
                            }
                        </>
                    }

                </Stack>

                {edit ?
                    <Stack direction='row'>
                        <TextField 
                            key={'TextFieldComentario_'+index}
                            maxRows={2} 
                            multiline 
                            fullWidth 
                            placeholder='Adicionar Comentário...'
                            defaultValue={comentario.comentario}
                            onKeyDown={editComent}
                            InputProps={{
                                endAdornment: 
                                    <Tooltip title="Cancelar edição">
                                        <IconButton size="small" onClick={() => setEdit(false)}>
                                            <CloseIcon fontSize="inherit"/>
                                        </IconButton>
                                    </Tooltip>
                            }}
                        />
                    </Stack>
                    :
                    <pre>
                        <Typography sx={{wordWrap: 'break-word', overflowWrap: 'anywhere'}} variant='body2' >
                            {comentario.comentario}
                        </Typography>
                    </pre>
                }

                <ConfirmAlert 
                    open={openDelete} 
                    setOpen={setOpenDelete} 
                    title='Excluir comentário?' 
                    subtitle='Deseja excluir permanentemente este comentário? (esta ação é irreversível)' 
                    callbackConfirm={deleteComent} 
                    callbackDecline={() => setOpenDelete(false)}
                />

            </Stack>
        </Stack>
    )
}