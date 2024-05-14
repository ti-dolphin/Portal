import { m } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, Container } from '@mui/material';
import Page from '../components/Page';
import { MotionContainer, varBounce } from '../components/animate';

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

type ErrorPageProps = {
  title: string,
  subtitle: string
}

export default function ErrorPage({ title, subtitle }: ErrorPageProps) {
  return (
    <MotionContainer sx={{ height: 1 }}>
      <Page title="Erro" sx={{ height: 1 }}>
        <RootStyle>
          <Container>
            <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
              <m.div variants={varBounce().in}>
                <Typography variant="h3" paragraph>
                  {title}
                </Typography>
              </m.div>
              <Typography sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            </Box>
          </Container>
        </RootStyle>
      </Page>
    </MotionContainer>
  );
}
