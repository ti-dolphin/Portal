import { useState, useEffect } from 'react';
import Page from '../../components/Page';
import { 
         Container, 
         Box,
         Card,
         CardContent,
        } from '@mui/material';
import Header from '../../components/Header';
import FullScreenDialog from '../../components/FullScreenDialog';
import { useNavigate } from 'react-router-dom'
import GroupForm from '../../components/grupo/GroupForm';
import CrudTable from '../../components/CrudTable';
import { api } from '../../config'
import { GetSession } from '../../session';
import Loading from '../../components/Loading'

export default function Usuario(){
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [usuarios, setUsuarios] = useState([])
    const [grupos, setGrupos] = useState([])
    const [loading,setLoading] = useState(false)
    const usuario = GetSession("@dse-usuario")

    const TABLE_HEAD = [
        { id: 'id', label: 'Id', alignRight: false },
        { id: 'nome', label: 'Nome', alignRight: false },
        { id: 'descricao', label: 'Descricao', alignRight: false },
        { id: 'status', label: 'Status', alignRight: false },
      ];

    const handleClose = () => {
        setOpen(false);
    };

    const openEditGrupo = (grupo) =>{
        setIsEdit(true);
        setSelectedGrupo(grupo);
        setOpen(true)
    }

    const openCreateGrupo = () =>{
        setIsEdit(false);
        setSelectedGrupo(null);
        setOpen(true)
    }

    const consultaGrupos = async () => {
        setLoading(true)
        const result = await api.get('usuario/t/10')
        setGrupos(result.data.dados)
        setUsuarios(result.data.usuarios)
        setLoading(false)
    }

    useEffect(()=>{
        consultaGrupos()
    },[])
    
    return (
        <>
            <Page title="Grupos">
                <Loading open={loading}/>
                <Container maxWidth={false}>
                    <Header title='GRUPOS DE USUÁRIOS' subtitle='EDIÇÃO, INCLUSÃO E VISUALIZAÇÃO' buttons={[{text: "USUÁRIOS", callback: () => navigate('/usuario') }, {text: 'PAPEIS', callback: () => navigate('/papel')}  ]}/>
                    <Box mb={3}/>
                        <Card>
                            <CardContent>
                                <CrudTable head={TABLE_HEAD} name='Tabela de Grupos de Usuários' rows={grupos} editCallback={openEditGrupo} createCallback={openCreateGrupo}/>
                            </CardContent>
                        </Card>
                </Container>
            </Page>
            <FullScreenDialog open={open} handleClose={handleClose}>
                <GroupForm callback={consultaGrupos} grupo={selectedGrupo} usuarios={usuarios} setOpen={setOpen} isEdit={isEdit}/>
            </FullScreenDialog>
        </>
    )
}