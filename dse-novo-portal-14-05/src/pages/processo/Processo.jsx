import Page from '../../components/Page';
import { 
    Container,
    Grid,
    Box,
   } from '@mui/material';
import { useState, useEffect } from 'react';
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import { GetSession } from '../../session';
import { api } from '../../config.ts'
import CardProcesso from '../../components/CardProcesso'
import SearchInput from '../../components/SearchInput'
import FullScreenDialog from '../../components/FullScreenDialog'
import ProcessosForm from '../../components/processo/ProcessosForm'
import ConfirmAlert from '../../components/ConfirmAlert'
import {notification} from '../../components/notification/notiflix'


export default function Processo(){
    const [idProcesso, setIdProcesso] = useState();
    const [openVolta, setOpenVolta] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [processos, setProcessos] = useState([])
    const [search, setSearch] = useState('')

    const usuario = GetSession("@dse-usuario")

    const handleClose = () => {
        setOpen(false);
    };

    const getProcessos = async () => {
        setLoading(true)
        if(search && search != ''){
            api.get('processo-cadastro?target[]=status&target_operator[]=!=&target_value[]=Inativo&target[]=nome&target_operator[]=like&target_value[]=%'+search+'%').then((processos)=>{
                setProcessos(processos.data)
                setLoading(false)
             })
        } else{
            var opcoes_categorias = [];
            var categorias = await api.get('categoria')
            var processos_novo = await api.get('processo-cadastro?target[]=status&target_value[]=Novo&target[]=empresa_id&target_value[]='+usuario.empresa_id);
            var processos = await api.get('processo-cadastro?target[]=status&target_value[]=Ativo&target[]=empresa_id&target_value[]='+usuario.empresa_id);
            setProcessos(processos_novo.data.concat(processos.data))
            categorias.data.map((categoria) => {
                opcoes_categorias.push({nome: categoria.nome, id: categoria.id})
              })
            setCategorias(opcoes_categorias);
            setLoading(false)
        }
    }

    const deleteProcesso = async () =>{
        await api.put('processo-cadastro',{
            id: idProcesso,
            status: 'Inativo'
          })
        setOpenDelete(false);
        getProcessos();
    }

    const voltaProcesso = async () =>{
        await api.post('processo-cadastro/volta',{
            id: idProcesso
          })
        notification('success', 'Processo retornado a versão anterior.')
        setOpenVolta(false);
        getProcessos();
    }


    useEffect(() => {
        getProcessos()
    },[search])

    return (
        <Page title="Processos">
            <Loading open={loading}/>
            <Container maxWidth={false}>
                <Header title='CONFIGURAÇÃO DE PROCESSOS' subtitle='CADASTRO, EDIÇÃO E VISUALIZAÇÃO DE PROCESSOS' buttons={[{text: "NOVO PROCESSO", callback: ()=>setOpen(true)}]}/>
                <Box mb={3}/>
                <Grid container spacing={3} direction="row">
                    <Grid item xs={12} md={4} lg={2}> 
                        <SearchInput callback={setSearch} label="Pesquisar Processo"/>
                    </Grid>

                    <Grid item xs={12} >
                        <Grid container spacing={4}>
                            {processos.map((processo) => (
                                <Grid key={"processo_"+processo.id} item xs={12} md={4} lg={3}>
                                    <CardProcesso data={{id: processo.id, title: processo.nome, date: processo.date}} callbackDelete={() => {setOpenDelete(true); setIdProcesso(processo.id)}} callbackVolta={() => {setOpenVolta(true); setIdProcesso(processo.id)}}/>
                                </Grid>
                           ))}
                        </Grid>
                    </Grid>

                </Grid>
            </Container>

            <FullScreenDialog open={open} handleClose={handleClose}>
                <ProcessosForm callback={getProcessos} setOpen={setOpen} categorias={categorias}/>
            </FullScreenDialog>

            <ConfirmAlert open={openDelete} setOpen={setOpenDelete} title='Excluir processo?' subtitle='Deseja excluir o processo?' callbackConfirm={deleteProcesso} callbackDecline={()=>setOpenDelete(false)}/>

            <ConfirmAlert open={openVolta} setOpen={setOpenVolta} title='Voltar processo para a versão anterior?' subtitle='Tem certeza que deseja voltar o processo para a versão anterior?' callbackConfirm={voltaProcesso} callbackDecline={()=>setOpenVolta(false)}/>
        </Page>
    )
}