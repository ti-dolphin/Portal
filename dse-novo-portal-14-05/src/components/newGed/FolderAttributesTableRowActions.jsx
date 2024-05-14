import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { 
    TableCell, 
    IconButton, 
    Tooltip
 } from '@mui/material';

export default function FolderAttributesTableRowActions({tipoSelect, mode, Delete, Edit, Cancel, Save}){

    return(
        <>
            <TableCell align="left" >
                <Tooltip title="Excluir">
                    <IconButton disabled={mode !== 0} onClick={() => Delete()}>
                        <DeleteIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="left" >
                <Tooltip title="Editar">
                    <IconButton disabled={mode !== 0 && !tipoSelect} onClick={() => Edit()}>
                        <EditIcon fontSize='small'/>
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="left" >
                <Tooltip title="Cancelar">
                    <IconButton disabled={mode === 0} onClick={() => Cancel()}>
                        <HighlightOffOutlinedIcon fontSize='small'/>
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="left" >
                <Tooltip title="Salvar">
                    <IconButton disabled={mode === 0} onClick={() => Save()}>
                        <SaveIcon fontSize='small'/>
                    </IconButton>
                </Tooltip>
            </TableCell>
            
        </>
    )
}