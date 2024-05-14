import Page from '../../components/Page';
import { 
         Container, 
         Typography,
         Grid,  
         Stack, 
         Box, 
         Switch, 
         FormControlLabel 
        } from '@mui/material';
import Header from '../../components/Header'
import Card from '../../components/Card'
import { GetSession } from '../../session';
import { useState, useEffect } from 'react';
import { api } from '../../config.ts'
import Loading from '../../components/Loading'
import { dataAtual } from '../../utils/utils';
import SearchInput from '../../components/SearchInput'
import FullScreenDialog from '../../components/FullScreenDialog';
import TemplateForm from '../../components/projeto/TemplateForm';
import ProjectForm from '../../components/projeto/ProjectForm'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from '../../redux/store';
import { getOptionsForm } from '../../redux/slices/project';

export default function Projeto(){

    const dispatch = useDispatch();
    const [form, setForm] = useState();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [statusProjetos, setStatusProjetos] = useState(true)
    const [modoConsulta, setModoConsulta] = useState(true)
    const [projetos, setProjetos] = useState([])
    const usuario = GetSession('@dse-usuario')
    const navigate = useNavigate();

    const handleClose = () => {
        setOpen(false);
    };

    const openCreateProject = () =>{
        setForm('Projeto')
        setOpen(true)
    }

    const openCreateTemplate = () =>{
        setForm('Template')
        setOpen(true)
    }

    const callbackCard = (data) => {
        navigate('/newdetalheprojeto/'+data.id)
        document.location.reload(true)
    }

    const callbackRating = async (data, newValue) => {

        if(newValue){
            await api.post('projeto-favoritos',{
                usuario_id : usuario.id,
                projeto_id: data.id,
                data: dataAtual()
            })
        } else{
            await api.delete('projeto-favoritos/'+data.id+'/'+usuario.id)
        }
    }

    const getOptions = async () => {
        await dispatch(getOptionsForm())
    }

    const consultaProjetos = async () => {
        setLoading(true)

        api.post('projeto-cadastro/consultaProjetos',{
            usuario_id : usuario.id,
            empresa_id : usuario.empresa_id,
            admin : usuario.tipo === "Administrador" ? 1 : 0,
            nome: search,
            status : statusProjetos ? 'Ativos': 'Todos',
            template : modoConsulta ? 'Projetos' : 'Templates'
        }).then((r) => {
            setProjetos(r.data.rows)
            setLoading(false)
        })

    }

    useEffect(() => {
        consultaProjetos()
    },[search, statusProjetos, modoConsulta])

    useEffect(()=>{
        getOptions()
    },[])

    return (
        <>
        <Page title="Projetos">
            <Loading open={loading}/>
            <Container maxWidth={false}>
            <Header title='PROJETOS' subtitle='CADASTRO, EDIÇÃO E VISUALIZAÇÃO DE PROJETOS' buttons={[{text: "NOVO PROJETO", callback: openCreateProject}, {text: 'NOVO TEMPLATE', callback: openCreateTemplate}]}/>
                <Box mb={3}/>
                <Grid container spacing={3} >
                    <Grid item xs={12} md={4} lg={2}> 
                        <SearchInput callback={setSearch} label="Pesquisar Projeto"/>
                    </Grid>

                        <Grid item xs={12} md={8} lg={10}>
                            <Stack direction="row" spacing={2}>
                                <FormControlLabel
                                    value="end"
                                    control={<Switch color="primary" checked={statusProjetos} onChange={()=>setStatusProjetos(!statusProjetos)} />}
                                    label={<Typography variant="caption">Todos/Ativos</Typography>}
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    value="end"
                                    control={<Switch color="primary" checked={modoConsulta} onChange={()=>setModoConsulta(!modoConsulta)}/>}
                                    label={<Typography variant="caption">Templates/Projetos</Typography>}
                                    labelPlacement="bottom"
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                            {projetos.map((projeto) => (
                                <Grid key={"projeto_"+projeto.id} item xs={12} md={6} lg={4}>
                                    <Card callbackCard={callbackCard} callbackRating={callbackRating} data={{id: projeto.id, avatar: projeto.imagem, title: projeto.nome, acompanhando: projeto.star === "fas fa-star" ? true : false}} headerOnly />
                                </Grid>
                            ))}        
                            </Grid>
                        </Grid>

                    </Grid>

                </Container>
        </Page>
        <FullScreenDialog open={open} handleClose={handleClose}>
            {form === 'Projeto' ?
                <ProjectForm callback={consultaProjetos} setOpen={setOpen}/>
                :
                <TemplateForm callback={consultaProjetos} setOpen={setOpen}/>
            }
        </FullScreenDialog>
      </>
    )
}