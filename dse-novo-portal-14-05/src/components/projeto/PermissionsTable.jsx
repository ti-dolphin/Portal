import { TableContainer, Table, TableHead, TableRow, TableCell, Button, TableBody } from '@mui/material'
import { useDispatch } from '../../redux/store'
import { deletePermission, getOptionsFormEdit } from '../../redux/slices/project'


export default function PermissionsTable({permissoesProjeto, idProjeto}){
    const dispatch = useDispatch();
    
    const excluiPermission = async (id)=>{
        await dispatch(deletePermission(id));
        await dispatch(getOptionsFormEdit(idProjeto));
    }


    return(
        <TableContainer sx={{mt:3, mb:3}}>
            <Table>
    
                <TableHead>
                    <TableRow>
                        <TableCell>Alvo</TableCell>
                        <TableCell >Nome</TableCell>
                        <TableCell align="right">Excluir permissão</TableCell>
                    </TableRow>
                </TableHead>
    
                <TableBody>
                    {permissoesProjeto.map((permissao) => (
                        <TableRow key={permissao.id}>
                            <TableCell component="th" scope="row">
                                {permissao.alvo}
                            </TableCell>
                            <TableCell >{permissao.alvo_nome}</TableCell>
                            <TableCell align="right"><Button variant='contained' color='error' onClick={() => excluiPermission(permissao.id)}>Excluir</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
    
            </Table>
        </TableContainer>
    )
}
