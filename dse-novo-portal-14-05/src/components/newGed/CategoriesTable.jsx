import { TableContainer, Table, TableHead, TableRow, TableCell, Button, TableBody } from '@mui/material'
import { useDispatch } from '../../redux/store';
import { updateCategorie, getCategories, getCategoriesWithResponsibles } from '../../redux/slices/paste'
import { useState } from 'react';
import CategorieDialog from './CategoriesDialog'

export default function CategoriesTable({ categories }) {
    const dispatch = useDispatch();
    const inativaCategorie = async (id) => {
        await dispatch(updateCategorie({ id, status: 'Inativo' }));
        await dispatch(getCategoriesWithResponsibles());
    }

    const ativaCategorie = async (id) => {
        await dispatch(updateCategorie({ id, status: 'Ativo' }));
        await dispatch(getCategoriesWithResponsibles());
    }

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };


    return (
        <TableContainer sx={{ mb: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Categoria</TableCell>
                        <TableCell align='right'>Responsável</TableCell>
                        <TableCell align="right">Ativar/Inativar</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {categories.map((categorie) => {
                        return (
                            <TableRow key={categorie.id}>
                                <TableCell component="th" scope="row">
                                    {categorie.categoria}
                                </TableCell>
                                <TableCell align='right'>
                                    <CategorieDialog handleOpen={handleOpenDialog} papel={categorie.papel} usuarios={categorie.usuarios} categorieId={categorie.id} />
                                </TableCell>
                                <TableCell align="right">
                                    {categorie.status === 'Ativo' ?
                                        <Button variant='contained' color='error' onClick={() => inativaCategorie(categorie.id)}>Inativar</Button>
                                        :
                                        <Button variant='contained' color='success' onClick={() => ativaCategorie(categorie.id)}>Ativar</Button>
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>

            </Table>
        </TableContainer>
    )
} 
