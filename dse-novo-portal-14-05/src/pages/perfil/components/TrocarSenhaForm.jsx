import {
    FormProvider,
    RHFPasswordField
} from '../../../components/hook-form';
import useTrocarSenha from '../hooks/TrocarSenha.hook'
import { Box, Card, Grid, Stack, Typography, Tabs, Tab, CardContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import InfoIcon from '@mui/icons-material/Info';

export default function TrocarSenhaForm(){
    const { trocarSenhaHook } = useTrocarSenha();

    return (
        <FormProvider methods={trocarSenhaHook.methods} onSubmit={trocarSenhaHook.handleSubmit(trocarSenhaHook.onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} >
                    <Card sx={{minHeight: '396px'}}>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <RHFPasswordField name="senhaAntiga" label="Senha Antiga"/>
                                </Grid>

                                <Grid item xs={12}>
                                    <RHFPasswordField name="novaSenha" label="Nova Senha"/>
                                    <Box sx={{padding: '8px'}}>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={0.5}
                                        >
                                            <InfoIcon sx={{color:'#637381'}} fontSize="small"/>
                                            <Typography sx={{fontSize: '12px', color:'#637381'}} variant='body2'>Mínimo 8 caracteres</Typography>
                                        </Stack>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <RHFPasswordField name="confirmaNovaSenha" label="Confirmar Nova Senha"/>
                                </Grid>
                            </Grid>

                            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                                <LoadingButton type="submit" variant="contained" loading={trocarSenhaHook.isSubmitting}>
                                    Salvar Alterações
                                </LoadingButton>
                            </Stack>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </FormProvider>
    )

}