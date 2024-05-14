import { Suspense, lazy, ElementType } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import MenuLayout from './layouts/menu';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
import LoadingScreen from './components/LoadingScreen';

const Loadable = (Component: ElementType) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    // {
    //   path: '/',
    //   element: <Navigate to="/login" replace />
    // },
    {
      path: '/politicas',
      element: <GuestGuard>
        <Politicas />
      </GuestGuard>
    },
    {
      path: '/login',
      element: <GuestGuard>
        <Login />
      </GuestGuard>
    },
    {
      path: '/recupera-senha',
      element: <GuestGuard>
        <EnviaEmail />
      </GuestGuard>
    },
    {
      path: '/nova-senha',
      element: <GuestGuard>
        <NovaSenha />
      </GuestGuard>
    },
    {
      path: '/',
      element: <AuthGuard>
        <MenuLayout />
      </AuthGuard>,
      children: [
        { element: <Navigate to="/rede-social/" replace />, index: true },
        {
          path: '/rede-social',
          children: [
            { element: <Navigate to="/rede-social/home" replace />, index: true },
            { path: 'home', element: <RedeSocial /> },
            { path: 'new', element: <NewPost /> },
            { path: 'post/:postId', element: <Post /> }
          ],
        },
        { path: '/home', element: <Home /> },
        { path: '/projetos', element: <Projeto /> },
        { path: '/processos', element: <Processos /> },
        { path: '/usuario', element: <Usuario /> },
        { path: '/empresa', element: <PageFour /> },
        { path: '/grupo', element: <Grupo /> },
        { path: '/detalhe-projeto/:id/:pasta_id', element: <PageFour /> },
        { path: '/configuracao-processo', element: <Processo /> },
        { path: '/configura-processo/:id', element: <ConfiguraProcessoBPMN /> },
        { path: '/papel', element: <Papel /> },
        { path: '/processo/:id', element: <TarefasProcesso /> },
        { path: '/acompanhamento-processo/:id', element: <PageFour /> },
        { path: '/meus-processos', element: <PageFour /> },
        { path: '/novo-processo', element: <PageFour /> },
        { path: '/realiza-processo/:id', element: <PageFour /> },
        { path: '/documentos/:id/:pasta_id', element: <PageFour /> },
        { path: '/newdetalheprojeto/:id/', element: <DetalheProjeto /> },
        { path: '/requisicao-materiais/:id/:projeto_id', element: <PageFour /> },
        { path: '/cadastro-requisicao-material/:id/:projeto_id', element: <PageFour /> },
        { path: '/gerencia-requisicao-material/:id', element: <PageFour /> },
        { path: '/bpmn', element: <PageFour /> },
        { path: '/gerencia-processo/:id_anterior/:id', element: <CadastraProcessoBPMN /> },
        { path: '/perfil', element: <Perfil /> },
        { path: '/ovo-de-pascoa', element: <Snake /> },
        { path: '/relatorios', element: <Relatorios />},
        { path: '/detalhe-documentos', element: <DetalheDocumentos />}
      ],
    },
    {
      path: '/tarefa-externa/:id',
      element: <TarefaExterna />
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// Dashboard
const Politicas = Loadable(lazy(() => import('./pages/Politicas')));
const PageFour = Loadable(lazy(() => import('./pages/PageFour')));
const NotFound = Loadable(lazy(() => import('./pages/Page404')));
const RedeSocial = Loadable(lazy(() => import('./pages/rede-social/RedeSocial')));
const Home = Loadable(lazy(() => import('./pages/home/Home')));
const Projeto = Loadable(lazy(() => import('./pages/projeto/Projeto')));
const Login = Loadable(lazy(() => import('./pages/Login')));
const Usuario = Loadable(lazy(() => import('./pages/usuario/Usuario')));
const Grupo = Loadable(lazy(() => import('./pages/grupo/Grupo')));
const Papel = Loadable(lazy(() => import('./pages/papel/Papel')));
const Processo = Loadable(lazy(() => import('./pages/processo/Processo')));
const ConfiguraProcessoBPMN = Loadable(lazy(() => import('./pages/processo/ConfiguraProcessoBPMN')));
const CadastraProcessoBPMN = Loadable(lazy(() => import('./pages/processo/BPMN/cadastro/CadastraProcessoBPMN')));
const DetalheProjeto = Loadable(lazy(() => import('./pages/newGed/DetalheProjeto')))
const TarefasProcesso = Loadable(lazy(() => import('./pages/tarefas-processo/TarefasProcesso')));
const TarefaExterna = Loadable(lazy(() => import('./pages/tarefas-processo/TarefaExterna')));
const Processos = Loadable(lazy(() => import('./pages/processos/Processos')));
const NewPost = Loadable(lazy(() => import('./pages/new-post/NewPost')));
const Post = Loadable(lazy(() => import('./pages/post/Post')));
const Perfil = Loadable(lazy(() => import('./pages/perfil/Perfil')))
const EnviaEmail = Loadable(lazy(() => import('./pages/resetSenha/EnviaEmail')))
const NovaSenha = Loadable(lazy(() => import('./pages/resetSenha/NovaSenha')))
const Snake = Loadable(lazy(() => import('./pages/Snake')))
const Relatorios = Loadable(lazy(() => import("./pages/relatorios/Relatorios"))) 
const DetalheDocumentos = Loadable(lazy(() => import('./pages/detalhe-documentos/DetalheDocumentos')))
