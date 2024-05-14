import { useState, useEffect } from 'react';
import moment from 'moment';
import Page from '../../components/Page';
import { 
         Container, 
         Box,
         Card,
         CardContent,
        } from '@mui/material';
import OfflinePinOutlinedIcon from '@mui/icons-material/OfflinePinOutlined';
import { useDispatch, useSelector } from '../../redux/store';
import { getProcessAbaProcessos } from '../../redux/slices/process';
import Header from '../../components/Header';
import Loading from '../../components/Loading'
import Filtro from '../../components/processos/Filtro';
import Table from '../../components/processos/Table';

export default function Processos(){
    const dispatch = useDispatch();
    const { isLoading, processAbaProcessos} = useSelector((state) => state.process) 
    const [filteredProcessos, setFilteredProcessos] = useState([]);
    const HEADER = [
        { id: 'avatar', label: 'Cliente', alignRight: false },
        { id: 'pid', label: 'PID', alignRight: false },
        { id: 'title', label: 'Projeto', alignRight: false },
        { id: 'processo', label: 'Processo', alignRight: false },
        { id: 'titulo', label: 'Título', alignRight: false },
        { id: 'gerente_do_projeto', label: 'Gerente do Projeto', alignRight: false },
        { id: 'data_inicio', label: 'Data de Início', alignRight: false },
        { id: 'andamento', label: <OfflinePinOutlinedIcon color='transparent'/>, alignRight: false },
        { id: 'tarefa_atual', label: 'Tarefa', alignRight: false },
        { id: 'prazo_tarefa', label: 'Prazo Tarefa', alignRight: false },
        { id: 'prazo_processo', label: 'Prazo Processo', alignRight: false },
        { id: 'status', label: 'Status', alignRight: false },
    ] 

    useEffect(() => {
        dispatch(getProcessAbaProcessos())
    },[])

    const callbackFiltro = (valores) => {
        var filteredAux = processAbaProcessos;

        valores.forEach((valor) =>{
            if(valor.valor && valor.valor !== '' && valor.valor != 'Invalid Date'){
                if(valor.index === 'data_inicio'){
                    filteredAux = filteredAux.filter((process) => moment(process[valor.index]).format('DD/MM/YYYY') === moment(valor.valor).format('DD/MM/YYYY'))
                }else if(valor.index === 'titulo'){
                    filteredAux = filteredAux.filter((process) => process[valor.index].toString().toUpperCase().includes(valor.valor.toString().toUpperCase()))
                }else if(valor.index === 'status'){
                    filteredAux = filteredAux.filter((process) =>  (valor.valor === 'Todos') || (process.data_fim && valor.valor === 'Concluído') || (!process.data_fim && valor.valor === 'Em Andamento'))
                }else if(valor.index === 'papel'){
                    filteredAux = filteredAux.filter((process) => process.papel === valor.valor || process.papelOriginal === valor.valor)
                }else{
                    filteredAux = filteredAux.filter((process) => process[valor.index] === valor.valor)
                }
            }
        })
        setFilteredProcessos(filteredAux);
    }
    
    return (
        <>
            <Page title="Processos">
                <Loading open={isLoading}/>
                <Container maxWidth={false}>
                    <Header title='PROCESSOS' subtitle='CONSULTA DE PROCESSOS'/>
                    <Box mb={3}/>
                        <Filtro callbackFiltro={callbackFiltro}/>
                        <Box mb={2}/>
                        <Card>
                            <CardContent>
                                 <Table data={filteredProcessos} header={HEADER}/>
                            </CardContent>
                        </Card>
                </Container>
            </Page>
        </>
    )
}