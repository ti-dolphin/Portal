import { useState, useEffect } from 'react';
import { TableContainer, Table, TablePagination, TableHead, TableCell, TableRow, Box, TableBody, Tooltip, IconButton } from '@mui/material';
import CrudTableToolBar from './CrudTableToolBar';
import EditIcon from '@mui/icons-material/Edit';

export default function CrudTable({name, head, rows, editCallback, createCallback}){
    const [rowsState, setRowsState] = useState(rows)
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [headArray, setHeadArray] = useState(head)

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      };

    const filterRows = (value) => {
        if(value && value != ''){
            var filtered = rows.filter((row) => {
                var verify = false
                Object.keys(row).map((key) => {
                    if(headArray.indexOf(key) !== -1){
                        if(row[key].toString().toLowerCase().indexOf(value.toLowerCase()) !== -1){
                            verify = true
                        }
                    }
                })
                
                if(verify){
                    return row
                }

            })
            setRowsState(filtered)
            setPage(0);
        } else{
            setRowsState(rows)
        }
    }

    useEffect(() => {
        setRowsState(rows)
    },[rows])

    useEffect(() => {
        var headArrayAux = []
        head.map((h) => {
            headArrayAux.push(h.id)
        })
        setHeadArray(headArrayAux)
    },[head])

    return(
        <>
            <CrudTableToolBar name={name} createCallback={createCallback} onFilterName={filterRows}/>
            <Box mb={2}/>
            <TableContainer>
                <Table>

                    <TableHead>
                        <TableRow>
                            <TableCell id='acao'>
                                Ação
                            </TableCell>
                            {head.map((row) => (
                                <TableCell key={'linhas_'+row.id}>
                                    {row.label}
                                </TableCell>
                            ))
                            }
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rowsState.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) =>{
                            const { id, nome, empresa, status, descricao } = row;
                            return(
                            <TableRow key={'linhas_'+id}>
                                <TableCell>
                                    <Tooltip title='Editar'>
                                            <IconButton onClick={() => editCallback(row)}>
                                                <EditIcon />
                                            </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{id}</TableCell>
                                <TableCell>{nome}</TableCell>
                                {empresa &&
                                    <TableCell>{empresa}</TableCell>
                                }
                                {descricao &&
                                    <TableCell>{descricao}</TableCell>
                                }
                                <TableCell>{status}</TableCell>
                            </TableRow>
                            )
                        })
                        }
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rowsState.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, page) => setPage(page)}
                onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
            />
        </>
    )
}