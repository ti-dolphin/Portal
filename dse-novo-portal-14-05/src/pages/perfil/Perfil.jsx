import useMeusDados from './hooks/MeusDados.hook';
import { Grid, Typography, Tabs, Tab, Container } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import Person from '@mui/icons-material/Person';
import VpnKey from '@mui/icons-material/VpnKey';
import Page from '../../components/Page';
import MeusDadosForm from './components/MeusDadosForm'
import TrocarSenhaForm from './components/TrocarSenhaForm'

export default function Perfil(){

    const { meusDadosHook } = useMeusDados();
    
    return (
        <Page title="Perfil do usuário">
            <Container maxWidth='lg'>   
                <TabContext value={meusDadosHook.currentTab}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant='h4'>
                                Meu Perfil
                            </Typography>
                        </Grid>

                        <Grid item xs={12} >
                            <Tabs
                                value={meusDadosHook.currentTab}
                                scrollButtons="auto"
                                variant="scrollable"
                                allowScrollButtonsMobile
                                onChange={(e, value) => meusDadosHook.setCurrentTab(value)}
                            >
                                <Tab
                                    disableRipple
                                    key={"Meus Dados"}
                                    label={"Meus Dados"}
                                    icon={<Person />}
                                    value={"Meus Dados"}
                                />
                                <Tab
                                    disableRipple
                                    key={"Trocar Senha"}
                                    label={"Trocar Senha"}
                                    icon={<VpnKey />}
                                    value={"Trocar Senha"}
                                />
                            </Tabs>
                        </Grid>

                        <Grid item xs={12}>
                            <TabPanel value="Meus Dados" index={0}>
                                <MeusDadosForm />
                            </TabPanel>
                            <TabPanel value="Trocar Senha" index={1}>
                                <TrocarSenhaForm />
                            </TabPanel>
                        </Grid>
                    </Grid>
                </TabContext>
            </Container>
        </Page>
    )
}