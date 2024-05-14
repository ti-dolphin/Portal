import {
    RHFUploadAvatar,
    FormProvider,
    RHFTextField,
    RHFDate,
    RHFMaskField
} from '../../../components/hook-form';
import useMeusDados from '../hooks/MeusDados.hook'
import { Box, Card, Grid, Stack, Typography, Tabs, Tab, CardContent } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export default function MeusDadosForm(){
    const { meusDadosHook } = useMeusDados();

    return (
        <FormProvider methods={meusDadosHook.methods} onSubmit={meusDadosHook.handleSubmit(meusDadosHook.onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ py: 10, px: 3 }}>
                        <Box sx={{ mb: 5 }}>
                            <RHFUploadAvatar
                                acceptAll={false}
                                name="avatar"
                                accept="image/*"
                                maxSize={3145728}
                                onDrop={meusDadosHook.handleDrop}
                                helperText={
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 2,
                                            mx: 'auto',
                                            display: 'block',
                                            textAlign: 'center',
                                            color: 'text.secondary',
                                        }}
                                    >
                                        Permitido *.jpeg, *.jpg, *.png, *.gif
                                        <br /> tamanho máximo de 3.1 MB
                                    </Typography>
                                }
                            />
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{minHeight: '396px'}}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'grid',
                                    columnGap: 2,
                                    rowGap: 3,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }
                                }}
                            >
                                <RHFTextField name="nome" label="Nome Completo" />
                                <RHFDate name="data_nascimento" label="Data de nascimento" />
                                <RHFMaskField name="celular" label="Telefone Celular" mask={'(99) 99999-9999'} />
                                <RHFTextField name="email" label="E-mail" />
                            </Box>

                            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                                <LoadingButton type="submit" variant="contained" loading={meusDadosHook.isSubmitting}>
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