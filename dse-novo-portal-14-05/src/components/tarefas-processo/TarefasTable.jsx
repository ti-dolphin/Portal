import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer } from '@mui/material';
import { useSelector } from '../../redux/store'
import CustomTableRow from './TableRow'

export default function TarefasTable({ callback }){
    const { passosProcesso } = useSelector((state) => state.step)
    const HEADER = [
        {label: ''},
        {label: 'Tarefa'},
        {label: 'Responsável'},
        {label: 'Prazo'},
        {label: 'Conclusão'},
        {label: ''},
    ]   

    return(
        <TableContainer sx={{ minWidth: '100%', mt: 3 }}>
            <Table>

                <TableHead sx={{minWidth:'100%'}}>
                    <TableRow>
                        {HEADER.map((row, index) => (
                            <TableCell sx={{boxShadow:'none !important'}} key={'header_'+index} align="left">{row.label} </TableCell>
                        ))   
                        }
                    </TableRow>
                </TableHead>

                <TableBody>
                    {passosProcesso.map((row, index) => 
                        <CustomTableRow key={'TarefasRow_'+index} row={row} callback={callback}/>
                    )}
                    
                </TableBody>

            </Table>
        </TableContainer>
    )
}