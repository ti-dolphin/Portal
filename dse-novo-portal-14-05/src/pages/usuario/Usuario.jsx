import { useState, useEffect } from 'react';
import Page from '../../components/Page';
import {
    Container,
    Box,
    Card,
    CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header';
import FullScreenDialog from '../../components/FullScreenDialog';
import UserForm from '../../components/usuario/UserForm';
import CrudTableUsuarios from '../../components/CrudTableUsuarios';
import { api } from '../../config'
import { GetSession } from '../../session';
import Loading from '../../components/Loading'
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import moment from 'moment';

export default function Usuario() {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [usuarios, setUsuarios] = useState([])
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const usuario = GetSession("@dse-usuario")

    const TABLE_HEAD = [
        { id: 'nome', label: 'Nome do Usuário', alignRight: false },
        { id: 'empresa', label: 'Empresa', alignRight: false },
        { id: 'id', label: 'Id', alignRight: false },
        { id: 'data_acesso', label: 'Último Acesso', alignRight: false },
        { id: 'publicacoes', label: <DriveFileRenameOutlineOutlinedIcon />, alignRight: false },
        { id: 'comentarios', label: <TextsmsOutlinedIcon />, alignRight: false },
        { id: 'likes', label: <FavoriteBorderOutlinedIcon />, alignRight: false },
        { id: 'ultima_interacao', label: 'Última Interação', alignRight: false },
        { id: 'status', label: 'Status', alignRight: false },
    ];

    const handleClose = () => {
        setOpen(false);
    };

    const openEditUser = (user) => {
        setIsEdit(true);
        setSelectedUser(user);
        setOpen(true)
    }

    const openCreateUser = () => {
        setIsEdit(false);
        setSelectedUser(null);
        setOpen(true)
    }

    const consultaUsuarios = async () => {
        setLoading(true);

        try {
            const [user, empresa, grupos] = await Promise.all([
                api.get('usuario-empresa?target[]=empresa_id&target_value[]=' + usuario.empresa_id),
                api.get('empresa/' + usuario.empresa_id),
                api.get('grupo?target[]=empresa_id&target_value[]=' + usuario.empresa_id)
            ]);

            const usuariosIds = user.data.map(user => user.usuario_id); 
            var usuarios = await api.get(`usuario/byIds?ids=${usuariosIds.join(',')}`); 
            var redesSociais = await  api.get(`usuario/infoRedeSocialByIds?ids=${usuariosIds.join(',')}`); 
            var gruposUsuarios = await api.get(`usuario-grupo?usuario_id=${usuariosIds.join('&usuario_id=')}`);


            const usuariosData = user.data.map(user => {
                try {
                    const usuarioId = user.usuario_id;
                    const us = usuarios.data.find(u => u.id === usuarioId);
                    const redesSociaisUser = redesSociais.data[0].ids.find(rs => rs === usuarioId);
                    const posts = redesSociais.data[0].posts.find(p => p.id === usuarioId)
                    const comments = redesSociais.data[0].comments.find(c => c.id === usuarioId)
                    const likes = redesSociais.data[0].likes.find(l => l.id === usuarioId)
                    const ultimaInteracao = determinarUltimaInteracao(posts.latest_post_date, comments.latest_comment_date, likes.latest_like_date);
                    const gruposUsuario = gruposUsuarios.data
                        .filter(grupoUser => grupoUser.usuario_id === usuarioId)
                        .map(grupoUser => grupos.data.find(grupo => grupo.id === grupoUser.grupo_id));

                    return {
                        'nome': us.nome,
                        'email': us.email,
                        'tipo': us.tipo,
                        'login': us.login,
                        'empresa': empresa.data[0].nome,
                        'id': us.id,
                        'data_acesso': us.data_acesso ? moment(us.data_acesso).format('DD/MM/YYYY-HH:mm') : '-',
                        'publicacoes': posts.post_count,
                        'comentarios': comments.comment_count,
                        'likes': likes.like_count,
                        'ultima_interacao': ultimaInteracao ? ultimaInteracao : '-',
                        'status': us.status,
                        'avatar': redesSociaisUser.avatar,
                        'grupos': gruposUsuario
                    };
                } catch (error) {
                    console.error("Erro ao processar usuário:", error);
                    return null;
                }
            }).filter(usuario => usuario !== null);

            usuariosData.sort(function (a, b) {
                return a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0;
            });

            setUsuarios(usuariosData);
            setGrupos(grupos.data);

        } catch (error) {
            console.error("Erro ao consultar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    const determinarUltimaInteracao = (postDate, commentDate, likeDate) => {
        const format = 'YYYY/MM/DD HH:mm';
        const datas = [postDate, commentDate, likeDate].filter(date => date && moment(date, 'YYYY/MM/DD HH:mm:ss', true).isValid());
        const sortedArray = datas.sort((a, b) => new Date(a) - new Date(b)).reverse();
        const ultimaInteracao = sortedArray[0];
    
        return ultimaInteracao ? moment(ultimaInteracao, 'YYYY/MM/DD HH:mm:ss').format(format) : '-';
    };
    
    

    // const consultaUsuarios = async () => {
    //     setLoading(true)
    //     var dados = [];
    //     var user = await api.get('usuario-empresa?target[]=empresa_id&target_value[]='+usuario.empresa_id);
    //     var empresa = await api.get('empresa/'+usuario.empresa_id);
    //     var grupos = await api.get('grupo?target[]=empresa_id&target_value[]='+usuario.empresa_id)

    //     const map = user.data.map(async (user) => {
    //         var grupos_do_usuario = []
    //         var us = await api.get('usuario/'+user.usuario_id)
    //         var grupos_user = await api.get('usuario-grupo?target[]=usuario_id&target_value[]='+user.usuario_id)
    //         var rede_social = await api.get('usuario/infoRedeSocial/'+user.usuario_id)

    //         grupos.data.map((grupo) => {
    //             grupos_user.data.map((grupo_user) => {
    //                 if(grupo.id == grupo_user.grupo_id){
    //                     grupos_do_usuario.push(grupo)
    //                 }
    //             })
    //         })

    //         dados.push({
    //             'nome' : us.data[0].nome,
    //             'email' : us.data[0].email,
    //             'tipo' : us.data[0].tipo,
    //             'login' : us.data[0].login,
    //             'empresa' : empresa.data[0].nome,
    //             'id' : us.data[0].id,
    //             'data_acesso' : us.data[0].data_acesso ? moment(us.data[0].data_acesso).format('DD/MM/YYYY-HH:mm') : '-',
    //             'publicacoes': rede_social.data.posts,
    //             'comentarios': rede_social.data.comentarios,
    //             'likes': rede_social.data.likes,
    //             'ultima_interacao' : rede_social.data.ultima_interacao ? moment(rede_social.data.ultima_interacao).format('DD/MM/YYYY-HH:mm') : '-',
    //             'status' : us.data[0].status,
    //             'avatar' : rede_social.data.avatar,
    //             'grupos': grupos_do_usuario
    //         })
    //     })

    //     await Promise.all(map);
    //     setGrupos(grupos.data)

    //     dados.sort(function(a,b) {
    //         return a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0;
    //     });

    //     setUsuarios(dados)
    //     setLoading(false)
    // }



    useEffect(() => {
        consultaUsuarios()
    }, [])

    return (
        <>
            <Page title="Usuários">
                <Loading open={loading} />
                <Container maxWidth={false}>
                    <Header title='USUÁRIOS' subtitle='EDIÇÃO, INCLUSÃO E VISUALIZAÇÃO' buttons={[{ text: "GRUPOS", callback: () => navigate('/grupo') }, { text: 'PAPEIS', callback: () => navigate('/papel') }]} />
                    <Box mb={3} />
                    <Card>
                        <CardContent>
                            <CrudTableUsuarios head={TABLE_HEAD} name='Tabela de Usuários' rows={usuarios} editCallback={openEditUser} createCallback={openCreateUser} />
                        </CardContent>
                    </Card>
                </Container>
            </Page>
            <FullScreenDialog open={open} handleClose={handleClose}>
                <UserForm callback={consultaUsuarios} grupos={grupos} user={selectedUser} setOpen={setOpen} isEdit={isEdit} />
            </FullScreenDialog>
        </>
    )
}