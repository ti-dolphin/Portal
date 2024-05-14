import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getProject, getCategories, getOptionsFormEdit } from '../../redux/slices/project';
import { useDispatch, useSelector } from '../../redux/store';
import { Icon } from '@iconify/react';
import Page from '../../components/Page';
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import Avatar from '../../components/Avatar'
import FullScreenDialog from '../../components/FullScreenDialog'
import ProjectForm from '../../components/projeto/ProjectForm'
import DocumentList from '../../components/newGed/DocumentList'
import ProcessList from '../../components/newGed/ProcessList'
import { GetSession } from '../../session';
import iCertificatePaperOutline from '@iconify/icons-healthicons/i-certificate-paper-outline';
import handshakeIcon from '@iconify/icons-fa-regular/handshake';
import shoppingCartOutline from '@iconify/icons-eva/shopping-cart-outline';
import fileContract from '@iconify/icons-la/file-contract';
import projectDiagram from '@iconify/icons-la/project-diagram';
import outlineEngineering from '@iconify/icons-ic/outline-engineering';
import peopleCommunity28Regular from '@iconify/icons-fluent/people-community-28-regular';
import peopleSettings28Regular from '@iconify/icons-fluent/people-settings-28-regular';
import moneyBagOutline from '@iconify/icons-healthicons/money-bag-outline';
import documentIcon from '@iconify/icons-ep/document';
import {
    Container,
    Box,
    Stack,
    Card,
    CardContent,
    CardActionArea,
    Typography,
} from "@mui/material"

export default function DetalheProjeto() {
    const [openEdit, setOpenEdit] = useState(false);
    const [active, setActive] = useState(0);
    const [abaAberta, setAbaAberta] = useState(0); // 0 é documento, 1 é processo
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")
    const { project, categories, isLoading } = useSelector((state) => state.project)
    const params = useParams()
    const [searchParams] = useSearchParams()
    const categorieId = searchParams.get("categorieId")
    
    useEffect(() => {
        dispatch(getProject(params.id));
        dispatch(getCategories(params.id));
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
          setActive(categories[0].id);
          if (categorieId !== null) {
            setActive(parseInt(categorieId));
          }
        }
      }, [categories, categorieId]);
      

    const callbackEdit = () => {
        dispatch(getProject(params.id));
        dispatch(getCategories(params.id));
    }

    const editProject = async () => {
        await dispatch(getOptionsFormEdit(params.id))
        setOpenEdit(true)
    }

    const obtemImagemCategoria = (nome) => {
        var src = process.env.PUBLIC_URL
        switch (nome) {
            case 'COMERCIAL':
                return <Icon icon={handshakeIcon} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'PMO':
                return <Icon icon={iCertificatePaperOutline} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'COMPRAS':
                return <Icon icon={shoppingCartOutline} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'FATURAMENTO':
                return <Icon icon={fileContract} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'FINANCEIRO':
                return <Icon icon={moneyBagOutline} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'ENGENHARIA':
                return <Icon icon={outlineEngineering} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'GESTÃO DE PESSOAS E SMS':
                return <Icon icon={peopleCommunity28Regular} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'OPERACIONAL':
                return <Icon icon={peopleSettings28Regular} style={{ width: 40, height: 40, color: '#F7941E' }} />

            case 'OUTROS':
                return <Icon icon={handshakeIcon} style={{ width: 40, height: 40, color: '#F7941E' }} />

            default:
                break;
        }

        return (
            <Avatar src={src} sx={{ width: 40, height: 40 }} />
        )
    }

    const callbackSearch = (value) => {
        console.log(value)
    }

    return (
        <Page title="Projetos">
            <Loading open={isLoading} />


            {project.nome &&
                <Container maxWidth={false}>

                    <Header
                        options={[
                            {
                                image: <Icon icon={documentIcon} style={{ width: 25, height: 25, color: '#F7941E' }} />,
                                active: abaAberta === 0, callback: () => setAbaAberta(0)
                            },
                            {
                                image: <Icon icon={projectDiagram} style={{ width: 25, height: 25, color: '#F7941E' }} />,
                                active: abaAberta === 1, callback: () => setAbaAberta(1)
                            }
                        ]}

                        image={project.imagem}
                        title={project.nome}
                        subtitle='DETALHES DO PROJETO'
                        buttons={
                            usuario.tipo === "Administrador" ?
                                [{ text: "EDITAR PROJETO", callback: () => editProject() }] :
                                []
                        }

                    />
                    <Box mb={3} />

                    <Stack direction="row" spacing={2} sx={{
                        paddingBlock: 2,
                        paddingInline: '5px',
                        overflow: 'auto'
                    }}>

                        {categories.map((categoria) => (
                            <Card key={'categoria_' + categoria.id} sx={{ backgroundColor: active === categoria.id ? (theme) => theme.palette.grey[300] : (theme) => theme.palette.grey[0], minWidth: '142px', maxWidth: '142px' }} onClick={() => setActive(categoria.id)}>
                                <CardActionArea>
                                    <CardContent>
                                        <Stack alignItems="center" spacing={1}>
                                            {obtemImagemCategoria(categoria.nome)}
                                            <Typography variant="caption" sx={{ minHeight: '54px', textAlign: 'center' }}>{categoria.nome}</Typography>
                                        </Stack>

                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        ))}

                    </Stack>

                    <Box mb={2} />

                    {abaAberta === 0 ?
                        <DocumentList idProjeto={project.id} idCategoria={active} active={active}/>
                        :
                        <ProcessList idCategoria={active} />
                    }

                </Container>

            }

            <FullScreenDialog open={openEdit} handleClose={() => setOpenEdit(false)}>
                <ProjectForm isEdit callback={callbackEdit} projeto={project} setOpen={setOpenEdit} />
            </FullScreenDialog>

        </Page>
    )
}