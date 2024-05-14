import { useEffect, useState } from 'react'
import { Stack, Tooltip, Box, Grid, Autocomplete, TextField, Button  } from '@mui/material'
import { useDispatch, useSelector } from '../../redux/store'
import createAvatar from '../../utils/createAvatar'
import MAvatar from '../MAvatar'
import ButtonAnimate  from '../animate/ButtonAnimate';
import Modal from '../modal/modal'
import { getUsers } from '../../redux/slices/users';
import { GetSession } from '../../session'
import { notification } from '../notification/notiflix'
import { getProcessExecution, setProcessResponsavel, getProcessResponsaveis } from '../../redux/slices/process'
import { getPassosProcess } from '../../redux/slices/step'
import Loading from '../Loading'


export default function Responsaveis(){
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")
    const { processResponsaveis, process } = useSelector((state) => state.process)
    const { flagPassosAntigos } = useSelector((state) => state.step)
    const [showModal, setShowModal] = useState(false)
    const [responsavel, setResponsavel] = useState()
    const { users } = useSelector((state) => state.users)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        dispatch(getUsers())
    }, [] )

    const modalResponsavel = () => {
        if(usuario.tipo === 'Administrador' || usuario.id === process.responsavel_id){
            setShowModal(true)
        } else{
            notification('warning', "Você não tem permissão para alterar o responsável do processo.")
        }
    }

    const editaResponsavel = () => {
        if(responsavel && responsavel.id){
            dispatch(setProcessResponsavel(process.id,responsavel.id))
            setShowModal(false)
            notification('success', "O responsável do processo foi alterado com sucesso.")
            reloadPage()
        } else{
            notification('warning', "É necessário selecionar um usuário.")
        }
    }

    const reloadPage = async () => {
        setIsLoading(true)
        await dispatch(getProcessExecution(process.id))
        await dispatch(getPassosProcess(process.id, flagPassosAntigos))
        await dispatch(getProcessResponsaveis(process.id))
        setIsLoading(false)
      }

    return(
        <Stack spacing={1} display='flex' direction='row'>
            <Loading open={isLoading}/>
            {processResponsaveis.length > 0 &&
                <>
                    <Tooltip title={processResponsaveis[0]?.nome}>
                        <ButtonAnimate onClick={() => modalResponsavel()}>
                            <MAvatar
                                variant='rounded'
                                alt={processResponsaveis[0]?.nome}
                                color={processResponsaveis[0]?.photoURL ? 'default' : createAvatar(processResponsaveis[0]?.nome).color}
                                sx={{ width: 32, height: 32 }}
                                src={ processResponsaveis[0]?.avatar ? processResponsaveis[0]?.avatar : ''}
                            >
                                {createAvatar(processResponsaveis[0]?.nome).name}
                            </MAvatar>
                        </ButtonAnimate>
                    </Tooltip>

                    {processResponsaveis.map((avatar, index) =>
                        index !== 0 &&
                            <Tooltip key={'AvatarResponsavel_'+index} title={avatar.nome}>
                                <MAvatar
                                    alt={avatar?.nome}
                                    color={avatar?.photoURL ? 'default' : createAvatar(avatar.nome).color}
                                    sx={{ width: 32, height: 32 }}
                                    src={ avatar.avatar ? avatar.avatar : ''}
                                >
                                    {createAvatar(avatar.nome).name}
                                </MAvatar>
                            </Tooltip> 
                    )}
                </>
            }

            <Modal 
                fechamodal={()=>{setShowModal(false)}} 
                title='Modificar responsável' 
                show={showModal}
            >
                <Box mb={2} />

                <Grid container spacing={2}>
                    
                    <Grid item xs={12} >
                        <Autocomplete
                            fullWidth
                            options={users}
                            getOptionLabel={(option) => option.nome}
                            filterSelectedOptions
                            defaultValue={null}
                            onChange={(event, newValue) => {
                                setResponsavel(newValue)
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params} 
                                    label="Usuário" 
                                    placeholder="Usuário"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button sx={{float: 'right'}} onClick={() => editaResponsavel()}>
                            Salvar
                        </Button>
                        <Button color="error" sx={{float: 'right'}} onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                    </Grid>

                </Grid>
            </Modal>
        </Stack>
    )

}