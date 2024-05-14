import { useState, useEffect } from 'react'
import { 
    Table, 
    TableRow, 
    TableHead, 
    TableBody, 
    TableCell, 
    TableContainer,
    IconButton, 
    Grid, 
    Typography, 
    Stack, 
    Tooltip
 } from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useDispatch, useSelector } from '../../redux/store'
import { getPasteAtrributes } from '../../redux/slices/paste'
import FolderAttributesTableRow from './FolderAttributesTableRow'

export default function FolderAttributesTable({ folder }){

    const dispatch = useDispatch();

    const header = [
        { id: 'id', label: 'ID', alignRight: false },
        { id: 'nome', label: 'Nome', alignRight: false },
        { id: 'tipo', label: 'Tipo', alignRight: false },
        { id: 'categoria', label: 'Categoria', alignRight: false },
        { id: 'preenchimento', label: 'Preenchimento', alignRight: false },
        { id: 'flag_filha', label: 'Aplicar a filhas', alignRight: false },
        { id: 'excluir', label: 'Excluir', alignRight: false },
        { id: 'editar', label: 'Editar', alignRight: false },
        { id: 'cancelar', label: 'Cancelar', alignRight: false },
        { id: 'salvar', label: 'Salvar', alignRight: false }
    ]

    const { pasteAttributes } = useSelector((state) => state.paste)
    const [attributesTable, setAttributesTable] = useState([])
    const [addAttribute, setAddAttribute] = useState(false) 

    useEffect(() => {
        dispatch(getPasteAtrributes(folder.id))
    },[])

    useEffect(() => {
        setAttributesTable(pasteAttributes)
    },[pasteAttributes])

    return(
        <Grid container>
            <Grid item xs={12} >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>Tabela de atributos</Typography>

                    <Tooltip title="Adicionar atributo">
                        <IconButton onClick={() => setAddAttribute(true)} >
                            <AddCircleOutlineOutlinedIcon  />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <TableContainer sx={{ minWidth: '100%', mt: 3 }}>
                    <Table>

                        <TableHead>
                            <TableRow>
                                {header.map((row, index) => (
                                    <TableCell key={'header_'+index} align="left">{row.label} </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            { addAttribute &&
                                <FolderAttributesTableRow initialMode={1} folder={folder} setAddAttribute={setAddAttribute}/>
                            }

                            {attributesTable.map((row) => (
                                <FolderAttributesTableRow key={"attribute_"+row.id} initialMode={0} folder={folder} attribute={row} />
                            ))}

                        </TableBody>

                    </Table>
                </TableContainer>
            </Grid>
        </Grid> 
    )
}