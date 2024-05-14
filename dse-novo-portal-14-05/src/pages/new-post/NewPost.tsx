// @mui
import { Container } from '@mui/material';

// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import NewPostForm from './components/NewPostForm'

// ----------------------------------------------------------------------

export default function NewPost() {

  return (
    <Page title="Blog: New Post">
      <Container maxWidth={false}>

        <HeaderBreadcrumbs
          heading="Novo Post"
          links={[
            {name:'Voltar ao Feed', href:'/rede-social/home'}, 
            {name:'Novo Post'}, 
          ]}
        />

        <NewPostForm />
      </Container>
    </Page>
  );
}
