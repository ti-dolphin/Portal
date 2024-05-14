import { useState } from 'react'
import { Button } from '@mui/material'
import { useDispatch, useSelector } from '../../redux/store'
import FullScreenDialog from '../FullScreenDialog'
import { GetSession } from '../../session';
import { getUsers, getUsersObservadores } from '../../redux/slices/users';
import { getProcessGed, getProcessInitial } from '../../redux/slices/process';
import ProcessoInitializeForm from '../processo/ProcessoInitializeForm'


export default function ProcessButton({ process, categoria_id }){
    const [openInitialize, setOpenInitialize] = useState(false)
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")
    const { project } = useSelector((state) => state.project)


    const abreModal = async () => {
        await dispatch(getUsersObservadores(process.id, 'Cadastro'))
        await dispatch(getUsers())
        setOpenInitialize(true)
    }

    const callbackInitialize = async () =>{
        await dispatch(getProcessGed(project.id, categoria_id))
        await dispatch(getProcessInitial(categoria_id))
    }
    
    return(
        <>
            <Button color='inherit' sx={{justifyContent:'flex-start', height:'100%'}} fullWidth variant='outlined' onClick={() => abreModal()}>
                {process.nome}
            </Button>

            <FullScreenDialog open={openInitialize} handleClose={() => {setOpenInitialize(false)}}>
                <ProcessoInitializeForm categoria_id={categoria_id} process={process} processo_id={process.id} setOpen={setOpenInitialize} callback={callbackInitialize}/>
            </FullScreenDialog>
      </>
    )
}