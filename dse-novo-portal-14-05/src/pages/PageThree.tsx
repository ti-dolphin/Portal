// @mui
import { Container, Typography, Button } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';


// ----------------------------------------------------------------------

export default function PageThree() {
  const { themeStretch } = useSettings();

  return (
    <Page title="Em desenvolvimento...">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Em desenvolvimento...
        </Typography>        
      </Container>
    </Page>
  );
}
