import { TableContainer, Table, TableHead, TableRow, TableCell, Button, TableBody } from '@mui/material'
import { useDispatch } from '../../redux/store';
import { deletePermission, getOptionsForm } from '../../redux/slices/paste'

export default function FolderPermissionsTable({permissoesPasta}){
    const dispatch = useDispatch();
    const excluiPermission = async (id)=>{
        await dispatch(deletePermission(id));
        await dispatch(getOptionsForm(id));
    }


    return(

        <TableContainer sx={{mt:3, mb:3}}>
          <Table>

              <TableHead>
                  <TableRow>
                      <TableCell>Alvo</TableCell>
                      <TableCell align="left">Nome</TableCell>
                      <TableCell align="left">Cadastro</TableCell>
                      <TableCell align="left">Consulta</TableCell>
                      <TableCell align="left">Edição</TableCell>
                      <TableCell align="left">Remoção</TableCell>
                      <TableCell align="right">Excluir permissão</TableCell>
                  </TableRow>
              </TableHead>

              <TableBody>
                  {permissoesPasta.map((permissao) => {
                      var arrayPermissoes = permissao.permissao.split('');
                      return(
                        <TableRow key={permissao.id}>
                            <TableCell component="th" scope="row">
                                {permissao.alvo}
                            </TableCell>
                            <TableCell align="left">{permissao.alvo_nome}</TableCell>
                            <TableCell align="left">{arrayPermissoes[0] === "1"? 'Sim' : 'Não'}</TableCell>
                            <TableCell align="left">{arrayPermissoes[1] === "1"? 'Sim' : 'Não'}</TableCell>
                            <TableCell align="left">{arrayPermissoes[2] === "1"? 'Sim' : 'Não'}</TableCell>
                            <TableCell align="left">{arrayPermissoes[3] === "1"? 'Sim' : 'Não'}</TableCell>
                            <TableCell align="right"><Button variant='contained' color='error' onClick={() => excluiPermission(permissao.id)}>Excluir</Button></TableCell>
                        </TableRow>
                      )
                })}
              </TableBody>

          </Table>
      </TableContainer>
    )
} 
