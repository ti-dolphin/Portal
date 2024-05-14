import { useState } from 'react';
import Page from 'src/components/Page';
import Loading from 'src/components/Loading';
import Header from 'src/components/Header';
import {
    Container,
    Box,
    Stack,
    Button,
    Card,
    IconButton,
    Grid,
    ButtonGroup,
    Typography
} from "@mui/material"
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import SecondaryTabs from './components/DetalheTabs';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DetalheActionCard from './components/DetalheDocumentosCards';
import { useTheme } from '@mui/material/styles';
import TableRelatorio from './components/DetalheDocumentosTable';
import useDocumentsDetails from './hooks/DetalheDocumentos.hook';
import { Navigate } from 'react-router';
import TextField from '@mui/material/TextField';


export default function DetalheRelatorios() {
    const [view, setView] = useState('Grid');
    const theme = useTheme();
    const detalheDocumentosHook = useDocumentsDetails()
    const head = [
        { id: 'document', label: 'Documento', alignRight: false },
        { id: 'project', label: 'Projeto', alignRight: false },
        { id: 'paste', label: 'Pasta', alignRight: false },
        { id: 'stats', label: 'Status', alignRight: false },
        { id: 'dueDate', label: 'Data de Vencimento', alignRight: false }

    ]

    return (
        <Page title='Relatórios'>
            <Loading open={detalheDocumentosHook.isLoading} />
            <Container maxWidth={false}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems='center' spacing={2}>
                    <Box flex={2}>
                        <Header title='DOCUMENTO' subtitle='DETALHES DO RELATÓRIO' />
                    </Box>
                    <TextField
                        label="Pesquisar"
                        variant="outlined"
                        value={detalheDocumentosHook.searchTerm}
                        onChange={detalheDocumentosHook.handleSearchChange}
                    />

                    <ButtonGroup sx={{ borderRadius: 3 }}>
                        <Button color='inherit' sx={{ backgroundColor: view === 'Grid' ? theme.palette.grey[400] : null }} onClick={() => setView('Grid')}>
                            <ViewModuleIcon />
                        </Button>
                        <Button color='inherit' sx={{ backgroundColor: view === 'List' ? theme.palette.grey[400] : null }} onClick={() => setView('List')}>
                            <ViewListIcon />
                        </Button>
                    </ButtonGroup>
                </Stack>
                <SecondaryTabs detalheDocumentosHook={detalheDocumentosHook} />
                <Box mt={2} />
                <Grid container spacing={2}>
                    {detalheDocumentosHook.searchDetails.length > 0 ? (
                        view === 'Grid' ? (
                            detalheDocumentosHook.searchDetails.map((detalheDocumentos) => (
                                <Grid key={"relatorio_" + detalheDocumentos.id} item xs={12} md={6} lg={4}>
                                    <DetalheActionCard
                                        isFavorite={detalheDocumentos.isFavorite}
                                        detalheDocumentosHook={detalheDocumentosHook}
                                        id={detalheDocumentos.id}
                                        data_vencimento={detalheDocumentos.data_vencimento}
                                        documento={detalheDocumentos.documento}
                                        projeto={detalheDocumentos.projeto}
                                        pasta={detalheDocumentos.pasta}
                                        onClick={() => detalheDocumentosHook.callbackCard(detalheDocumentos.projeto_id, detalheDocumentos.pasta_id, detalheDocumentos.categoria_id)}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Card sx={{ width: '100%', mt: 3 }}>
                            <TableRelatorio header={head} relatorios={detalheDocumentosHook.searchDetails} detalheDocumentosHook={detalheDocumentosHook} />
                        </Card>
                        )
                    ) : (
                        <Grid container direction="column" alignItems="center" justifyContent="flex-start" mt={2}>
                        <Typography variant="h6">Não há detalhes disponíveis.</Typography>
                    </Grid>
                    )}
                </Grid>
            </Container>
        </Page>
    )

}

