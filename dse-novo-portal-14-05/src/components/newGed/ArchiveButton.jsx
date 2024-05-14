import { useState } from 'react';
import { Stack, Button, Menu, MenuItem } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { getURLArchive, inativeArchive, ativeArchive , deleteArchive} from '../../redux/slices/archives';
import { useDispatch } from '../../redux/store';
import ConfirmAlert from '../ConfirmAlert';
import FullScreenDialog from '../FullScreenDialog';
import ArchiveFormRename from './ArchiveFormRename';
import ArchiveAttributes from './ArchiveAttributes';
import { GetSession } from '../../session';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export default function ArchiveButton({ GetPastesAndArchives, archive }){
    const dispatch = useDispatch();
    const [openRename, setOpenRename] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [openInative, setOpenInative] = useState(false);
    const [openAtive, setOpenAtive] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAttributes, setOpenAttributes] = useState(false);
    const [anchorEl, setAnchorEl] = useState();
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
    
    const openArchive = async (archive) => {
        const response = await dispatch(getURLArchive(archive.id))
        window.open(response)
    }

    const inative = async () => {
        await dispatch(inativeArchive(archive.id))
        setOpenInative(false);
        GetPastesAndArchives();
    }

    const ative = async () => {
        await dispatch(ativeArchive(archive.id))
        setOpenAtive(false);
        GetPastesAndArchives();
    }

    const fullDelete = async () => {
        await dispatch(deleteArchive(archive.id))
        setOpenDelete(false);
        GetPastesAndArchives();
    }

    const contextMenu = (e, id) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setOpenMenu(true);
    }

    return(
        <>
            <Button 
                onMouseDown={handleMouseDown} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp}
                color='inherit'
                sx={{
                    justifyContent:'flex-start',
                    height:'100%',
                    userSelect:'none'
                }} 
                fullWidth variant='outlined' 
                startIcon={<DescriptionIcon/>} 
                onClick={() => openArchive(archive)}
                onContextMenu={(event) => contextMenu(event,archive.id)}
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
                        {archive.titulo}
                    </Stack>

                    <Stack
                        sx={{ width: '100%'}}
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-start"
                    >
                        <SettingsOutlinedIcon onClick={(event) => {event.stopPropagation(); contextMenu(event)}}/>
                    </Stack>

                </Stack>
            </Button>

            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={openMenu}
              onClose={()=>{setAnchorEl(null); setOpenMenu(false)}}
            >
                <MenuItem onClick={()=>{setOpenRename(true); setOpenMenu(false) }}> Renomear Documento </MenuItem>
                <MenuItem onClick={archive.status === 'Ativo' ? ()=> setOpenInative(true) : ()=> setOpenAtive(true)}> {archive.status === 'Ativo' ? 'Inativar Documento' : 'Ativar Documento'} </MenuItem>  
                <MenuItem onClick={()=>{setOpenAttributes(true); setOpenMenu(false) }}> Atributos do Documento </MenuItem>
                {usuario.tipo === "Administrador" &&
                    <MenuItem onClick={()=>{setOpenDelete(true); setOpenMenu(false) }}> Excluir Documento Permanentemente </MenuItem>
                }
            </Menu>


            <FullScreenDialog open={openRename} handleClose={() => {setOpenRename(false); setOpenMenu(false)}}>
                <ArchiveFormRename GetPastesAndArchives={GetPastesAndArchives} archive={archive} setOpen={setOpenRename}/>
            </FullScreenDialog>

            <FullScreenDialog open={openAttributes} handleClose={() => {setOpenAttributes(false); setOpenMenu(false)}}>
                <ArchiveAttributes GetPastesAndArchives={GetPastesAndArchives} archive={archive} setOpen={setOpenAttributes}/>
            </FullScreenDialog>

            <ConfirmAlert open={openInative} setOpen={setOpenInative} title='Inativar documento?' subtitle='Deseja inativar este documento?' callbackConfirm={inative} callbackDecline={()=>setOpenInative(false)}/>

            <ConfirmAlert open={openAtive} setOpen={setOpenAtive} title='Ativar documento?' subtitle='Deseja ativar este documento?' callbackConfirm={ative} callbackDecline={()=>setOpenAtive(false)}/>

            <ConfirmAlert open={openDelete} setOpen={setOpenDelete} title='Excluir documento?' subtitle='Deseja excluir permanentemente este documento?' callbackConfirm={fullDelete} callbackDecline={()=>setOpenDelete(false)}/>
        </>
    )
}