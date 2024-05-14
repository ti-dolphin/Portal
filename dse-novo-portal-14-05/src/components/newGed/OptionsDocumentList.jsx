import { useEffect, useState } from 'react';
import { Fab, Stack, TextField, MenuItem, Tooltip, ButtonGroup, Button  } from '@mui/material';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { useDispatch, useSelector } from '../../redux/store'
import { getPermissionPaste } from '../../redux/slices/paste'
import FullScreenDialog from '../FullScreenDialog';
import FolderForm from './FolderForm';
import ArchiveForm from './ArchiveForm';
import { verifyPermission } from '../../utils/utils'

export default function OptionsDocumentList({ GetPastesAndArchives, idCategoria, idProjeto, status, setStatus,  selectedPaste, view, setView }){
    const OPCOES = ['Ativo', 'Inativo', 'Todos'];
    const dispatch = useDispatch();
    const [openFolder, setOpenFolder] = useState(false);
    const [openArchive, setOpenArchive] = useState(false);
    const { permissoesPasta } = useSelector((state) => state.paste)

    useEffect(() => {
        if(selectedPaste){
            dispatch(getPermissionPaste(selectedPaste))
        }
    },[selectedPaste])

    const changeOption = (e) => {
        if(e.target.value === 'Ativo'){
            setStatus(0)
        }else if(e.target.value === 'Inativo'){
            setStatus(1)
        }else{
            setStatus(2)
        }
    }

    return(
        <Stack direction='row' spacing={2} alignItems='center'>
            <TextField
                value={status === 0 ? 'Ativo' : status === 1 ? 'Inativo' : 'Todos'}
                onChange={changeOption}
                select
            >
                {OPCOES.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))
                }
            </TextField>
            
            {selectedPaste &&
                <Tooltip title="Enviar arquivo">
                    <Fab onClick={() => setOpenArchive(true)}>
                        <NoteAddOutlinedIcon/>
                    </Fab>
                </Tooltip>
            }

            {verifyPermission(permissoesPasta)[0] &&
                <Tooltip title="Cadastrar pasta">
                    <Fab onClick={() => setOpenFolder(true)}>
                        <CreateNewFolderOutlinedIcon/>
                    </Fab>
                </Tooltip>
            }

            <ButtonGroup sx={{borderRadius:3, height:'50px'}}>
                <Button color='inherit' sx={{backgroundColor: view === 'List' ? (theme) => theme.palette.grey[400] : null}} onClick={() => setView('List')}>
                    <ViewListIcon />
                </Button> 
                <Button color='inherit' sx={{backgroundColor: view === 'Grid' ? (theme) => theme.palette.grey[400] : null}} onClick={() => setView('Grid')}>
                    <ViewModuleIcon />
                </Button>
            </ButtonGroup>


            <FullScreenDialog open={openFolder} handleClose={() => setOpenFolder(false)}>
                <FolderForm GetPastesAndArchives={GetPastesAndArchives} selectedPaste={selectedPaste} idCategoria={idCategoria} idProjeto={idProjeto} setOpen={setOpenFolder} />
            </FullScreenDialog>

            <FullScreenDialog open={openArchive} handleClose={() => setOpenArchive(false)}>
                <ArchiveForm GetPastesAndArchives={GetPastesAndArchives} selectedPaste={selectedPaste} idCategoria={idCategoria} idProjeto={idProjeto} setOpen={setOpenArchive}/>
            </FullScreenDialog>
        </Stack>
    )
}