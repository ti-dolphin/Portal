import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer, TablePagination, Card, TableSortLabel, Box } from '@mui/material';
import { useState } from 'react'
import { visuallyHidden } from '@mui/utils';
import moment from 'moment';
import ProcessGedTableRow from './ProcessGedTableRow'
import OfflinePinOutlinedIcon from '@mui/icons-material/OfflinePinOutlined';


export default function ProcessGedTable({ processGed, callbackRating }){
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('pid');

    const HEAD = [
        { id: 'pid', label: 'PID', alignRight: false },
        { id: 'processo', label: 'Processo', alignRight: false },
        { id: 'titulo', label: 'Título', alignRight: false },
        { id: 'andamento', label: <OfflinePinOutlinedIcon color='transparent'/>, alignRight: false },
        { id: 'tarefa_atual', label: 'Tarefa', alignRight: false },
        { id: 'prazo_tarefa', label: 'Prazo Tarefa', alignRight: false },
        { id: 'prazo_processo', label: 'Prazo Processo', alignRight: false },
        { id: 'comentario', label: '', alignRight: false },
        { id: 'acompanhando', label: '', alignRight: false },
      ];
      
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const comparator = (a,b)=>{
        if(orderBy === 'pid'){
            if(order === 'asc'){
                if(a[orderBy] > b[orderBy]){
                    return 1
                }else if(a[orderBy] < b[orderBy]){
                    return -1
                }else{
                   return 0
                }
             }else{
               if(a[orderBy] < b[orderBy]){
                   return 1
               }else if(a[orderBy] > b[orderBy]){
                   return -1
               }else{
                  return 0
               }
             }
        }else if(orderBy.includes('prazo')){
            if(order === 'asc'){
                if( moment(new Date(a[orderBy])).diff(moment(new Date(b[orderBy]))) > 0){
                    return 1
                }else if(moment(new Date(a[orderBy])).diff(moment(new Date(b[orderBy]))) < 0){
                    return -1
                }else{
                   return 0
                }
             }else{
               if(moment(new Date(b[orderBy])).diff(moment(new Date(a[orderBy]))) < 0){
                   return -1
               }else if(moment(new Date(b[orderBy])).diff(moment(new Date(a[orderBy]))) > 0){
                   return 1
               }else{
                  return 0
               }
             }
        }else if(orderBy !== 'acompanhando' && orderBy !=='comentario'){
            if(order === 'asc'){
                if(a[orderBy].toUpperCase() > b[orderBy].toUpperCase()){
                    return 1
                }else if(a[orderBy].toUpperCase() < b[orderBy].toUpperCase()){
                    return -1
                }else{
                   return 0
                }
             }else{
               if(a[orderBy].toUpperCase() < b[orderBy].toUpperCase()){
                   return 1
               }else if(a[orderBy].toUpperCase() > b[orderBy].toUpperCase()){
                   return -1
               }else{
                  return 0
               }
             }
        }
    }
      
      
      function stableSort(array) {
        var aux = JSON.parse(JSON.stringify(array))
        aux.sort((a, b) => {
            return comparator(a,b)
        });
        return aux;
      }

    return(
        <Card sx={{width:'100%'}}>
            <TableContainer sx={{ minWidth: '100%', mt: 3 }}>
                <Table>

                    <TableHead>
                        <TableRow>
                            {HEAD.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                sortDirection={orderBy === headCell.id ? order : false}
                            >
                                <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                                >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                                </TableSortLabel>
                            </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {stableSort(processGed).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => 
                            <ProcessGedTableRow key={'RowGed_'+index} row={row} callbackRating={callbackRating}/>
                        )}
                    </TableBody>
                    
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={processGed.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, page) => setPage(page)}
                onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
            />
        </Card>
    );
}