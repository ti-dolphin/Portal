import { Grid, Box, Card, CardContent, Stack, TextField, Container, Button, Typography, Link } from '@mui/material';
import { useState } from 'react';
import Page from '../components/Page';
import Loading from '../components/Loading'
import { urlPainel } from '../config'
import { useTheme } from '@mui/material/styles'
import { SetSession } from '../session';
import useResponsive from '../hooks/useResponsive';
import AxiosService from 'src/api/axios_service';
import { dispatch } from 'src/redux/store';
import { findOrCreateUserCollection } from 'src/redux/slices/notification';
import { subscribeToTopic } from 'src/api/firebase_service';
// import { subscribeToTopic } from 'src/api/firebase_service';

export default function Login() {
	const isDesktop = useResponsive('up', 'md');
	const theme = useTheme()
	const [user, setUser] = useState('')
	const [password, setPassword] = useState('')
	const [validateUser, setValidateUser] = useState(false)
	const [validatePassword, setValidatePassowrd] = useState(false)
	const [validateLogin, setValidateLogin] = useState(false)
	const [loading, setLoading] = useState(false)

	const Login = async () => {
		try {
			setValidatePassowrd(false)
			setValidateLogin(false)
			var verify = true

			if (!user || user === '') {
				verify = false
				setValidateUser(true)
			}

			if (!password || password === '') {
				verify = false
				setValidatePassowrd(true)
			}

			if (verify) {
				setLoading(true)
				setValidateUser(false)
				setValidatePassowrd(false)
				const encodedString = Buffer.from(`${user}:${password}`).toString('base64');
				const axiosService = new AxiosService();
				const { accessToken, refreshToken } = await axiosService.get(
					'auth/login',
					{
						headers: {
							'authorization': `Bearer ${encodedString}`
						}
					}
				);
				axiosService.setTokens(accessToken, refreshToken);
				let usuario = await axiosService.get(`usuario/getUserData`);
				const notificationCollectionId = await dispatch(findOrCreateUserCollection(usuario.id));
				usuario.notificationCollectionId = notificationCollectionId;
				SetSession("@dse-usuario", usuario);
				const topico = `user_${usuario.id}`
				await subscribeToTopic(topico);
				window.location.href = `${urlPainel}rede-social`;
			}
		} catch (error) {
			console.error(error);
			setValidateLogin(true);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Page title="Login">
			<Loading open={loading} />
			<Box mb={4} />
			<Container maxWidth={'xl'}>
				<Grid container alignItems="center" justifyContent="center">
					<Grid item xs={12} md={4}>
						<Card sx={{ padding: 4, boxShadow: isDesktop ? theme.shadows[7] : theme.shadows[0] }}>
							<CardContent>
								<Grid container alignItems="center" justifyContent="center">
									<Stack spacing={2} sx={{ width: '100%' }}>
										<Grid item xs={12}>
											<Grid container alignItems="center" justifyContent="center">
												<img src="./img/logo.png" alt=''/>
											</Grid>
										</Grid>
										<Box mt={6} />
										<Grid item xs={12}>
											<TextField
												onKeyUp={(event) => {
													if (event.key === 'Enter') Login()
												}}
												error={validateUser}
												fullWidth
												label="Usuário"
												value={user}
												onChange={(e) => setUser(e.target.value)}
												helperText={validateUser ? "Preencha este campo" : null}
											/>
										</Grid>

										<Grid item xs={12}>
											<TextField
												onKeyUp={(event) => {
													if (event.key === 'Enter') Login()
												}}
												error={validatePassword}
												fullWidth
												label="Senha"
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												helperText={validatePassword ? "Preencha este campo" : null}
											/>
										</Grid>

										<Grid item xs={12}>
											<Stack
												direction="row"
												justifyContent="flex-end"
												alignItems="center"
											>
												<Link href="/recupera-senha" variant="body2">Esqueceu sua senha?</Link>
											</Stack>
										</Grid>
										{validateLogin &&
											<Grid item xs={12}>
												<Typography sx={{ color: theme.palette.error.main }}>Usuário ou senha não encontrados, favor tente novamente.</Typography>
											</Grid>
										}
										<Grid item xs={12}>
											<Button variant="contained" onClick={() => Login()} sx={{ width: '100%', height: '48px' }}> Autenticar </Button>
										</Grid>

									</Stack>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
}