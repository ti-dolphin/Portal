import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableRow, TableHead, TableBody, TableCell, TableContainer, TablePagination, TableSortLabel, IconButton, Rating, Box } from '@mui/material';
import { setProcess } from '../redux/slices/process'
import moment from 'moment';
import { useDispatch } from '../redux/store'
import { visuallyHidden } from '@mui/utils';
import Label from './Label'
import CustomTableRow from './TableRow'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import id from 'date-fns/esm/locale/id/index.js';

export default function ReportTable({relatorios}){
    return(
        <>
        <TableContainer sx={{ minWidth: '100%', mt: 3}}>
            <Table>

                <TableHead>
                    
                </TableHead>

            </Table>

        </TableContainer>
        </>
    )
}

