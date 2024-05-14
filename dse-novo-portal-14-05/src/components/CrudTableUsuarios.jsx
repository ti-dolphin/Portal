import { useState, useEffect } from 'react';
import { TableContainer, Table, TablePagination, TableHead, TableCell, TableRow, Box, TableBody, Tooltip, IconButton, Stack, Typography } from '@mui/material';
import CrudTableToolBar from './CrudTableToolBar';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import moment from 'moment';
import MAvatar from './MAvatar'
import createAvatar from '../utils/createAvatar';
import Label from './Label'

export default function CrudTableUsuarios({name, head, rows, editCallback, createCallback}){
    const [rowsState, setRowsState] = useState(rows);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);
    const [headArray, setHeadArray] = useState(head);

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
                        if(row[key] && row[key].toString().toLowerCase().includes(value.toString().toLowerCase())){
                            verify = true
                        }
                    }
                })
                
                if(verify){
                    return row
                }

            })
            setRowsState(filtered)
            if(rowsPerPage === -1){
                setRowsPerPage(filtered.length)
            }
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
                            {head.map((row) => (
                                <TableCell key={'linhas_'+row.id}>
                                    {row.label}
                                </TableCell>
                            ))}
                            <TableCell id='acao'>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rowsState.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) =>{
                            const { nome, avatar, empresa, id, data_acesso, publicacoes, comentarios, likes, ultima_interacao, status } = row;
                            return(
                            <TableRow key={'linhas_'+id}>
                                <TableCell>                                    
                                    <Stack direction='row' spacing={1} alignItems='center'>
                                        <MAvatar
                                            color={createAvatar(nome).color}
                                            sx={{ width: 32, height: 32 }}
                                            src={ avatar ? avatar : '' }
                                        >
                                            {createAvatar(nome).name}
                                        </MAvatar>

                                        <Typography variant='body2' sx={{color: (theme) => theme.palette.grey[900]}}>
                                            {nome}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{empresa}</TableCell>
                                <TableCell>{id}</TableCell>
                                <TableCell>{data_acesso}</TableCell>
                                <TableCell>{publicacoes}</TableCell>
                                <TableCell>{comentarios}</TableCell>
                                <TableCell>{likes}</TableCell>
                                <TableCell>{ultima_interacao}</TableCell>
                                <TableCell>
                                    <Label color={row.status === 'Ativo' ? 'success' : 'error'}>{row.status}</Label> 
                                </TableCell>
                                <TableCell>
                                    <Tooltip title=''>
                                            <IconButton onClick={() => editCallback(row)}>
                                                <MoreVertOutlinedIcon />
                                            </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                            )
                        })
                        }
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Todos' }]}
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