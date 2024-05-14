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
import PapelForm from '../../components/papel/PapelForm';
import CrudTable from '../../components/CrudTable';
import { useNavigate } from 'react-router-dom'
import { api } from '../../config'
import { GetSession } from '../../session';
import Loading from '../../components/Loading'

export default function Usuario(){
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [selectedPapel, setSelectedPapel] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [usuarios, setUsuarios] = useState([])
    const [pepeis, setPapeis] = useState([])
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

    const openEditPapel = (papel) =>{
        setIsEdit(true);
        setSelectedPapel(papel);
        setOpen(true)
    }

    const openCreatePapel = () =>{
        setIsEdit(false);
        setSelectedPapel(null);
        setOpen(true)
    }

    const consultaPapeis = async () => {
        setLoading(true)
        var usuarios = [];
        var dados = [];
        var users = await api.get('usuario-empresa?target[]=empresa_id&target_value[]='+usuario.empresa_id);
        var papeis = await api.get('papel?target[]=empresa_id&target_value[]='+usuario.empresa_id);

        const map = papeis.data.map(async (papel) =>{
            var paper_users = [];
            var usuarios_do_papel = await api.get('usuario-papel?target[]=papel_id&target_value[]='+papel.id);

            const map2 = usuarios_do_papel.data.map(async (usuario) => {
                var user = await api.get('usuario/'+usuario.usuario_id);
                paper_users.push({id: user.data[0].id, nome: user.data[0].nome })
            })
            
           await Promise.all(map2);
           dados.push({
               id: papel.id,
               nome: papel.nome,
               descricao: papel.descricao,
               status: papel.status,
               usuarios: paper_users,
           })
        })

        const map3 = users.data.map( async (user) =>{
            var us = await api.get('usuario/'+user.usuario_id)
            usuarios.push({id: us.data[0].id, nome: us.data[0].nome})
        })

        await Promise.all(map3)
        await Promise.all(map)

        setPapeis(dados)
        setUsuarios(usuarios)
        setLoading(false)
    }

    useEffect(()=>{
        consultaPapeis()
    },[])
    
    return (
        <>
            <Page title="Grupos">
                <Loading open={loading}/>
                <Container maxWidth={false}>
                    <Header title='PAPEIS' subtitle='EDIÇÃO, INCLUSÃO E VISUALIZAÇÃO' buttons={[{text: "USUÁRIOS", callback: () => navigate('/usuario') }, {text: 'GRUPOS', callback: () => navigate('/grupo')}  ]}/>
                    <Box mb={3}/>
                        <Card>
                            <CardContent>
                                <CrudTable head={TABLE_HEAD} name='Tabela de Papeis de Usuários' rows={pepeis} editCallback={openEditPapel} createCallback={openCreatePapel}/>
                            </CardContent>
                        </Card>
                </Container>
            </Page>
            <FullScreenDialog open={open} handleClose={handleClose}>
                <PapelForm callback={consultaPapeis} grupo={selectedPapel} usuarios={usuarios} setOpen={setOpen} isEdit={isEdit}/>
            </FullScreenDialog>
        </>
    )
}