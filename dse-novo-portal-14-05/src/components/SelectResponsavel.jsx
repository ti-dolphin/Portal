import { useRef , useState, useEffect } from 'react'
import { Stack, Typography, MenuItem, Divider } from '@mui/material'
import { useDispatch, useSelector } from '../redux/store'
import { getUsersByPapel } from '../redux/slices/users'
import { updateResponsavel } from '../redux/slices/step'
import { getProcessResponsaveis } from '../redux/slices/process';
import MenuPopover from './MenuPopover';
import MAvatar from './MAvatar'
import ButtonAnimate from './animate/ButtonAnimate';
import createAvatar from '../utils/createAvatar';


export default function SelectResponsavel({ passo, inative }){
    const dispatch = useDispatch();
    const anchorRef = useRef(null);
    const { usersByPapel } = useSelector((state) => state.users)
    const [open, setOpen] = useState(false);
    const [isPapelResponsavel, setIsPapelResponsavel] = useState(!passo.responsavel_id)
    const [responsavel, setResponsavel] = useState(passo.responsavel_id ? {id: passo.responsavel_id, nome: passo.responsavel_nome, avatar: passo.avatar ? passo.avatar : false} : {id: passo.papel_id, nome: passo.papel_nome, avatar: passo.avatar ? passo.avatar : false})
    const nomeResponsavel = responsavel && responsavel.nome && responsavel.nome.split(' ');

    useEffect(() =>{
        setResponsavel(passo.responsavel_id ? {id: passo.responsavel_id, nome: passo.responsavel_nome, avatar: passo.avatar ? passo.avatar : false} : {id: passo.papel_id, nome: passo.papel_nome, avatar: passo.avatar ? passo.avatar : false})
        setIsPapelResponsavel(!passo.responsavel_id)
    },[passo])

    const handleOpen = async (e) => {
        e.stopPropagation();
        if(passo.papel_id !== 0 && passo.papel_id !== 6){
            await dispatch(getUsersByPapel(passo.papel_id))
            setOpen(true);
        }
    };

    const handleClose = (e) => {
        e.stopPropagation();
        setOpen(false);
    };

    const setUserResponsavel = async (e,id, nome, avatar) => {
        e.stopPropagation();
        if(responsavel.id !== id){
            var response = await dispatch(updateResponsavel({
                id: passo.id,
                responsavel_id: id,
            }))
            if(response){
                await dispatch(getProcessResponsaveis(passo.processo_id))
                setResponsavel({id, nome, avatar})
                setIsPapelResponsavel(false)
            }
        }
        setOpen(false);
    };

    const setPapelResponsavel = async (e) => {
        e.stopPropagation();
        if(!isPapelResponsavel){
            var response = await dispatch(updateResponsavel({
                id: passo.id,
                responsavel_id: null,
            }))
            if(response){
                await dispatch(getProcessResponsaveis(passo.processo_id))
                setResponsavel({id: passo.papel_id, nome: passo.papel_nome})
                setIsPapelResponsavel(true)
            }
        }
        setOpen(false);
    };


    return(
        <>
        {nomeResponsavel &&
            <>
            <ButtonAnimate
                inative={inative}
                ref={anchorRef}
                onClick={(e) => !inative && handleOpen(e)}
                sx={{ '&:hover': { cursor: 'pointer' } }}
            >
                <Stack direction='row' spacing={1} alignItems='center'>

                        <MAvatar
                            color={createAvatar(responsavel.nome).color}
                            sx={{ width: 32, height: 32 }}
                            src={responsavel.avatar ? responsavel.avatar : ''}
                        >
                            {createAvatar(responsavel.nome).name}
                        </MAvatar>

                        <Typography variant='body2' sx={{color: inative ? (theme) => theme.palette.grey[500] : (theme) => theme.palette.grey[900]}}>
                            {nomeResponsavel.shift()} {nomeResponsavel.length > 1 ? nomeResponsavel.pop() : ''}
                        </Typography>

                </Stack>
            </ButtonAnimate>

            <MenuPopover
                alignLeft
                withoutArrow
                open={open}
                onClose={(e) => handleClose(e)}
                anchorEl={anchorRef.current}
                sx={{ width: 220 }}
            >
                <Stack spacing={0.5} sx={{ p: 1 }}>
                    <MenuItem
                        onClick={(e) => setPapelResponsavel(e)}
                        selected={isPapelResponsavel}
                        sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
                    >
                        {passo.papel_nome}
                    </MenuItem>

                    <Divider/>

                    {usersByPapel.map((option) => (
                        <MenuItem
                            key={option.id}
                            onClick={(e) => setUserResponsavel(e,option.id, option.nome, option.avatar ? option.avatar : false)}
                            sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
                            selected={responsavel.id === option.id}
                        >
                            {option.nome}
                        </MenuItem>
                    ))}
                </Stack>
            </MenuPopover>
            </>
        }
        </>
    )
}