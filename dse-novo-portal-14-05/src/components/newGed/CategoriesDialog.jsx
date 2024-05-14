import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField, IconButton, Autocomplete, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { GetSession } from 'src/session';
import { api } from 'src/config';
import { dispatch } from 'src/redux/store';
import { addResponsibleCategoriePaste, removeResponsiblesCategoriePaste } from 'src/redux/slices/paste';
// import { addResponsibleCategoriePaste } from 'src/redux/slices/paste';
import { useSnackbar } from 'notistack';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useState, useEffect, Fragment } from 'react';
import { getCategoriesWithResponsibles } from 'src/redux/slices/paste';

export default function CategorieDialog({ categorieId, usuarios, papel }) {
    const [open, setOpen] = useState(false);
    const [responsible, setResponsible] = useState([]);
    const [user, setUser] = useState([]);
    const [paper, setPaper] = useState([])
    const [users, setUsers] = useState([]);
    const [papeis, setPapeis] = useState([]);
    const usuario = GetSession("@dse-usuario")
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

        const consultaOptions = async () => {
            const usersResponse = await api.get('usuario?target[]=status&target_value[]=Ativo');
            const papeisResponse = await api.get('papel?target[]=empresa_id&target_value[]=' + usuario.empresa_id);

            setUsers(usersResponse.data);
            setPapeis(papeisResponse.data);
        }

        consultaOptions()
    }, [])

    const handleClickOpen = async () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
            const users = user.map((r) => ({
                tipo: 'usuário',
                usuario: r.id,
            }));
            const papers = paper.map((r) => ({
                tipo: 'papel',
                papel: r.id,
            }))
            const responsibles = users.concat(papers)
    
            await dispatch(removeResponsiblesCategoriePaste({ categorieId }))
            await dispatch(addResponsibleCategoriePaste({
                categoryId: categorieId,
                responsibles
            }))
            await dispatch(getCategoriesWithResponsibles())
            handleClose()

};

    const handleUserChange = (event, newValues) => {
        setResponsible(newValues);
        setUser(newValues)
    };

    const handlePaperChange = (event, newValues) => {
        setResponsible(newValues);
        setPaper(newValues)
    };


    useEffect(() => {
        if (usuarios && usuarios.length > 0 && users && users.length > 0) {
            const values = []
            users.map((option) => {
                usuarios.map((value) => {
                    if (option.id === value.usuario) {
                        values.push(option)
                    }
                })
            })
            setUser(values)
        }
    }, [users])

    useEffect(() => {

        if (papel && papel.length > 0 && papeis && papeis.length > 0) {
            const values = []
            papeis.map((option) => {
                papel.map((value) => {
                    if (option.id === value.papel) {
                        values.push(option)
                    }
                })
            })
            setPaper(values)
        }
    }, [papeis])

    return (
        <Fragment>
            {papel && papel.length > 0 ? (
                <Typography>
                    {papel[0].nomePapel}
                    <IconButton aria-label="delete" onClick={handleClickOpen}>
                        <DriveFileRenameOutlineIcon />
                    </IconButton>
                </Typography>
            ) : usuarios && usuarios.length > 0 ? (
                <Typography>
                    {usuarios[0].nomeUsuario}
                    <IconButton aria-label="delete" onClick={handleClickOpen}>
                        <DriveFileRenameOutlineIcon />
                    </IconButton>
                </Typography>
            ) : (
                <IconButton aria-label="delete" onClick={handleClickOpen}>
                    <AddIcon variant="outlined" />
                </IconButton>

            )}

            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Editar Responsável</DialogTitle>
                <DialogContent>
                    <Box
                        noValidate
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: '350px',
                        }}
                    >
                        <FormControl sx={{ mt: 4, minWidth: 120 }}>
                            <Autocomplete
                                autoFocus
                                sx={{ mt: 2 }}
                                multiple
                                id="user-autocomplete"
                                options={users}
                                defaultValue={user}
                                onChange={(event, newValues) => handleUserChange(event, newValues)}
                                getOptionLabel={(option) => option.nome}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Usuários"
                                    />
                                )}
                            />

                            <Autocomplete
                                autoFocus
                                sx={{ mt: 2 }}
                                multiple
                                id="paper-autocomplete"
                                options={papeis}
                                defaultValue={paper}
                                onChange={(event, newValues) => handlePaperChange(event, newValues)}
                                getOptionLabel={(option) => option.nome}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Papeis"
                                    />
                                )}
                            />


                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} style={{ backgroundColor: 'red', color: 'white' }}>Cancelar</Button>
                    <Button onClick={handleSave} style={{ backgroundColor: 'blue', color: 'white' }}>Salvar</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
