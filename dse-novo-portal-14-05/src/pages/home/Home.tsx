import { useEffect } from 'react'
import { getPrazo } from '../../utils/utils'
// @mui
import { Container } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';

// Pages
import Favoritos from './Favoritos';
import EmAndamento from './EmAndamento';

// ----------------------------------------------------------------------

export default function Home() {

  return (
    <Page title="Home">
      <Container maxWidth={false}>
        <Favoritos/>
        <EmAndamento/>
      </Container>
    </Page>
  );
}
