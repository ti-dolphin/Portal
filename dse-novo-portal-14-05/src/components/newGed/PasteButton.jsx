import { useState } from 'react'
import { Stack, Button, Menu, MenuItem } from '@mui/material'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { useDispatch } from '../../redux/store'
import { getAllCategories, getPasteAtrributes, getParameters, getItems, getOptionsForm, getCategories, updatePaste, getCategoriesWithResponsibles } from '../../redux/slices/paste'
import ConfirmAlert from '../ConfirmAlert';
import FullScreenDialog from '../FullScreenDialog'
import FolderForm from './FolderForm'
import FolderFormMove from './FolderFormMove'
import FolderFormEditName from './FolderFormEditName'
import FolderFormPermissions from './FolderFormPermissions'
import CategorieForm from './CategorieForm'
import { GetSession } from '../../session';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export default function PasteButton({ GetPastesAndArchives, paste, callback }){
    const [openCategorie, setOpenCategorie] = useState(false);
    const [openPermissions, setOpenPermissions] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openEditName, setOpenEditName] = useState(false);
    const [openMove, setOpenMove] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [anchorEl, setAnchorEl] = useState();
    const [openDelete, setOpenDelete] = useState(false);
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")

    const [timer, setTimer] = useState(null);

    const handleMouseDown = (e) => {
      const newTimer = setTimeout(() => {
        contextMenu(e)
      }, 500);
      setTimer(newTimer);
    };
  
    const handleMouseUp = () => {
      clearTimeout(timer);
    };

    const contextMenu = (e) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setOpenMenu(true);
    }

    const changeStatusPaste = async () => {
        let statusPasta = paste.status === 'Ativo' ? 'Inativo' : 'Ativo'
        await dispatch(updatePaste({id: paste.id,status: statusPasta}))
        GetPastesAndArchives();
    }

    const moveFolder = async () => {
        await dispatch(getAllCategories());
        setOpenMove(true);
        setOpenMenu(false);
    }

    const editName = async () =>{
        setOpenMenu(false);
        await dispatch(getPasteAtrributes(paste.id));
        await dispatch(getParameters());
        await dispatch(getItems(paste.id));
        setOpenEditName(true);
    }

    const permissions = async () => {
        setOpenMenu(false);
        await dispatch(getOptionsForm(paste.id));
        setOpenPermissions(true);
    }

    const createCategorie = async () => {
        setOpenMenu(false);
        await dispatch(getCategoriesWithResponsibles())
        setOpenCategorie(true);
    }

    const deleteFolder = async () => {
        setOpenDelete(false);
        await dispatch(updatePaste({id: paste.id,status: 'Excluído'}))
        GetPastesAndArchives();
    }

    return(
        <>
            <Button 
                color='inherit' 
                onMouseDown={handleMouseDown} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp} 
                sx={{
                    justifyContent:'flex-start', 
                    height:'100%',
                    userSelect:'none'
                }} 
                fullWidth 
                variant='outlined' 
                startIcon={<FolderOpenOutlinedIcon/>} 
                onClick={() => callback(paste)} 
                onContextMenu={(event) => contextMenu(event,paste.id)}
                // endIcon={<SettingsOutlinedIcon />}
            >
                <Stack
                    sx={{ width: '100%'}}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                >
                    <Stack
                        sx={{ width: '100%'}}
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        {paste.nome}
                    </Stack>

                    <Stack
                        sx={{ width: '100%'}}
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-start"
                    >
                        <SettingsOutlinedIcon onClick={(event) => {event.stopPropagation(); contextMenu(event,paste.id)}}/>
                    </Stack>

                </Stack>
            </Button>

            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={openMenu}
                onClose={()=>{setAnchorEl(null); setOpenMenu(false)}}
            >
                <MenuItem onClick={() => changeStatusPaste()}> {paste.status === 'Ativo' ? 'Inativar pasta' : 'Ativar pasta'} </MenuItem>
                {usuario.tipo === "Administrador" && 
                    [
                    <MenuItem onClick={() => {setOpenEdit(true); setOpenMenu(false) }}> Editar pasta </MenuItem>,
                    <MenuItem onClick={() => permissions()}> Permissões </MenuItem>  ,
                    <MenuItem onClick={() => moveFolder()}> Mover pasta </MenuItem>,
                    <MenuItem onClick={() => editName()}> Editar padrão de nome de arquivos </MenuItem>,
                    <MenuItem onClick={() => createCategorie()}> Editar categorias </MenuItem>,
                    <MenuItem onClick={()=>{setOpenDelete(true); setOpenMenu(false) }}> Excluir Pasta Permanentemente</MenuItem>
                    ]
                }
            </Menu>

            <FullScreenDialog open={openEdit} handleClose={() => {setOpenEdit(false); setOpenMenu(false)}}>
                <FolderForm GetPastesAndArchives={GetPastesAndArchives} folder={paste} isEdit setOpen={setOpenEdit}/>
            </FullScreenDialog>

            <FullScreenDialog open={openMove} handleClose={() => {setOpenMove(false); setOpenMenu(false)}}>
                <FolderFormMove GetPastesAndArchives={GetPastesAndArchives} folder={paste} setOpen={setOpenMove}/>
            </FullScreenDialog>

            <FullScreenDialog open={openEditName} handleClose={() => {setOpenEditName(false); setOpenMenu(false)}}>
                <FolderFormEditName GetPastesAndArchives={GetPastesAndArchives} folder={paste} setOpen={setOpenEditName}/>
            </FullScreenDialog>

            <FullScreenDialog open={openPermissions} handleClose={() => {setOpenPermissions(false); setOpenMenu(false)}}>
                <FolderFormPermissions GetPastesAndArchives={GetPastesAndArchives} folder={paste} setOpen={setOpenPermissions}/>
            </FullScreenDialog>

            <FullScreenDialog open={openCategorie} handleClose={() => {setOpenCategorie(false); setOpenMenu(false)}}>
                <CategorieForm GetPastesAndArchives={GetPastesAndArchives} setOpen={setOpenCategorie}/>
            </FullScreenDialog>

            <ConfirmAlert open={openDelete} setOpen={setOpenDelete} title='Excluir pasta?' subtitle='Deseja excluir permanentemente esta pasta?' callbackConfirm={deleteFolder} callbackDecline={()=>setOpenDelete(false)}/>

      </>
    )
}