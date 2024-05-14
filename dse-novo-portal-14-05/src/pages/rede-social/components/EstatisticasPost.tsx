import { Grid, Stack, Typography, Box, Table, TableRow, TableHead, TableBody, TableCell, TableContainer, TablePagination, TableSortLabel, Card, CardContent } from "@mui/material"
import { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { fShortenNumber } from '../../../utils/formatNumber';
import MAvatar from '../../../components/MAvatar'
import createAvatar from '../../../utils/createAvatar';

type Props = {
    post: any;
}

export default function EstatisticasPost({post}: Props){
    const [usuariosState, setUsuariosState] = useState([])
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const likes = post.likes.map(l => l.usuario_id)
        const coments = post.comentarios.map(c => c.usuario_id)

        const setUser = new Set();

        const usuarios = post.likes.concat(post.comentarios).filter((user: any) => { 
            const duplicatedUser = setUser.has(user.usuario_id);
            setUser.add(user.usuario_id);
            return !duplicatedUser;
        });

       const newUsers =  usuarios.map((user) => {
            let userReturn = JSON.parse(JSON.stringify(user));
            if(likes.indexOf(user.usuario_id) !== -1){
                userReturn.like = true
            } else{
                userReturn.like = false
            }

            userReturn.qtdComentarios = coments.filter(c => c === user.usuario_id).length
            return userReturn
        })

        setUsuariosState(newUsers)

    },[])

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

    return(
        <Grid container spacing={4}>
            <Grid item xs={12}> 
                <Typography variant='h4'>
                    Post #{post.id} - Estatísticas
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Grid container direction={'row'} alignItems='center' >
                    <Grid item 
                        sx={{
                            border: '1px solid rgba(145, 158, 171, 0.24)',
                            borderRadius: '8px',
                            width: '140px',
                            height: '124px',
                            padding: '24px'
                        }}
                    >
                        <Stack alignItems='center'>
                            <PersonIcon sx={{ fontSize: 30, color: '#2B3990' }}/>
                            <Typography sx={{fontWeight: '700', fontSize: '20px'}}>
                                {fShortenNumber(usuariosState.length)}
                            </Typography>
                            <Typography sx={{fontWeight: '400', fontSize: '12px', color: '#637381'}}>
                                Usuários
                            </Typography>
                        </Stack>
                    </Grid>

                    <Box mr={2}/>

                    <Grid item
                        sx={{
                            border: '1px solid rgba(145, 158, 171, 0.24)',
                            borderRadius: '8px',
                            width: '140px',
                            height: '124px',
                            padding: '24px'
                        }}
                    >
                        <Stack alignItems='center'>
                            <ChatIcon sx={{ fontSize: 30, color: '#2B3990' }}/>
                            <Typography sx={{fontWeight: '700', fontSize: '20px'}}>
                                {fShortenNumber(post.comentarios.length)}
                            </Typography>
                            <Typography sx={{fontWeight: '400', fontSize: '12px', color: '#637381'}}>
                                Comentários
                            </Typography>
                        </Stack>
                    </Grid>

                    <Box mr={2}/>

                    <Grid item
                        sx={{
                            border: '1px solid rgba(145, 158, 171, 0.24)',
                            borderRadius: '8px',
                            width: '140px',
                            height: '124px',
                            padding: '24px'
                        }}
                    >
                        <Stack alignItems='center'>
                            <FavoriteIcon sx={{ fontSize: 30, color: '#2B3990' }}/>
                            <Typography sx={{fontWeight: '700', fontSize: '20px'}}>
                                {fShortenNumber(post.likes.length)}
                            </Typography>
                            <Typography sx={{fontWeight: '400', fontSize: '12px', color: '#637381'}}>
                                Curtidas
                            </Typography>
                        </Stack>
                    </Grid>

                </Grid>

            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <TableContainer sx={{ minWidth: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nome do Usuário</TableCell>
                                        <TableCell><ChatIcon /></TableCell>
                                        <TableCell><FavoriteIcon /></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    
                                {usuariosState.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                    return(
                                        <TableRow >
                                            <TableCell>
                                                <Stack direction='row' spacing={1} alignItems='center'>
                                                    <MAvatar
                                                        color={createAvatar(row.usuario_nome).color}
                                                        sx={{ width: 32, height: 32 }}
                                                        src={ row.avatar ? row.avatar : '' }
                                                    >
                                                        {createAvatar(row.usuario_nome).name}
                                                    </MAvatar>

                                                    <Typography variant='body2' sx={{color: (theme) => theme.palette.grey[900]}}>
                                                        {row.usuario_nome}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{parseInt(row.qtdComentarios) > 0 ? row.qtdComentarios : '-'}</TableCell>
                                            <TableCell>{row.like ? 'Sim' : '-'}</TableCell>
                                        </TableRow>
                                        )
                                    })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={usuariosState.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, page) => setPage(page)}
                            onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
                        />
                    </CardContent>
                </Card>
                <Box mb={6} />
            </Grid>
        </Grid>
    )
}