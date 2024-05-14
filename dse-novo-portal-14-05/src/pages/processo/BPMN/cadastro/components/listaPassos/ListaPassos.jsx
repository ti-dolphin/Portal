import { useEffect } from 'react';
import Passo from './components/passo/Passo'
import { api } from '../../../../../../config.ts'
import { useAtom } from "jotai"
import {Passos} from './PassoAtom'
import { Card, CardContent, Stack } from "@mui/material"
import CircularProgress from '@mui/material/CircularProgress';


export default function ListaPassos(props){
    const [passos,setPassos] = useAtom(Passos)

    useEffect(() => {
        setPassos(null)
        getPassos()
    },[])

    const getPassos = () => {
        api.get('processo-passo-cadastro/ordem/'+props.processo.id).then((passos) => {
            setPassos(passos.data)
        })
    }

    return(
        <Card>
            <CardContent>
                {
                passos ? // <Passo key={"passo_"+30} index={30}/> 
                passos.map((passo,index) => (
                    <Passo key={"passo_"+index} index={index}/>
                ))
                 : 
                    <Stack alignItems="center">
                        <CircularProgress />
                    </Stack>
                    }
            </CardContent>
        </Card>
    )
}
