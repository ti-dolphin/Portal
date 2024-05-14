import { useEffect } from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material'
import { getProcessInitial, getProcessGed } from '../../redux/slices/process';
import { setUsersObservadores, deletUserObservador } from '../../redux/slices/users';
import { useDispatch, useSelector } from '../../redux/store';
import ProcessButton from './ProcessButton'
import ProcessGedTable from './ProcessGedTable'
import Loading from '../Loading'
import { GetSession } from '../../session';


export default function ProcessList({ idCategoria }){
    const usuario = GetSession("@dse-usuario")
    const dispatch = useDispatch();
    const { processInitial, isLoading, processGed } = useSelector((state) => state.process)
    const { project } = useSelector((state) => state.project)

    useEffect(()=>{
        dispatch(getProcessGed(project.id, idCategoria))
        dispatch(getProcessInitial(idCategoria))
    },[idCategoria])

    const callbackRating = async (data, newValue) => {
        if(newValue){
            await dispatch(setUsersObservadores(data.pid, usuario.id, 'Execução')) // Insere usuário como acompanhante do processo
        } else{
            await dispatch(deletUserObservador(data.pid, usuario.id, 'Execução')) // Remove usuário do acompanhamento do processo
        }

        dispatch(getProcessGed(project.id, idCategoria))
    }

    return(
        <Grid container spacing={2} sx={{mt:2}}>
            <Loading open={isLoading}/>
            <Grid item xs={12} mb={1}>
                <Typography variant='h5'>
                    Iniciar Novo Processo
                </Typography>
            </Grid>

            {processInitial.length > 0 ? 
                processInitial.map((process) => 
                    <Grid key={'process_'+process.id} item lg={3} md={4} sm={6} xs={12}>
                        <ProcessButton process={process} categoria_id={idCategoria}/>
                    </Grid>  
                )
                :
                <Card>
                    <CardContent>
                        <Typography variant='h6'>
                            Não existe(m) processo(s) para inicialização nesta categoria.
                        </Typography>
                    </CardContent>
                </Card>
            }

        </Grid>
    )
}