import { useEffect, useState } from 'react'
import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer, TablePagination, TableSortLabel, Box } from '@mui/material';
import moment from 'moment';
import { visuallyHidden } from '@mui/utils';
import CustomTableRow from './TableRow'

export default function CustomTable({ header, data }){
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('title');
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [page, setPage] = useState(0);
    
    useEffect(() => {
        setPage(0);
    }, [data])

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
                if(a[orderBy]?.toString().toUpperCase() > b[orderBy]?.toString().toUpperCase()){
                    return 1
                }else if(a[orderBy]?.toString().toUpperCase() < b[orderBy]?.toString().toUpperCase()){
                    return -1
                }else{
                   return 0
                }
             }else{
               if(a[orderBy]?.toString().toUpperCase() < b[orderBy]?.toString().toUpperCase()){
                   return 1
               }else if(a[orderBy]?.toString().toUpperCase() > b[orderBy]?.toString().toUpperCase()){
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
        <>
        <TableContainer sx={{ minWidth: '100%', mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {header.map((headCell) => (
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
                    {stableSort(data).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => 
                        <CustomTableRow key={'TableRow_'+index} row={row}/>
                    )}
                </TableBody>

            </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
        />
        </> 
    )
}