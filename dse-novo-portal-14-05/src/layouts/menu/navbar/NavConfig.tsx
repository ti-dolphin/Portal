// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name: string) => (
  <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Portal Dolphin',
    items: [
      { title: 'Início', path: '/rede-social', icon: ICONS.dashboard },
      { title: 'Minhas Tarefas', path: '/home', icon: ICONS.user },
      { title: 'Projetos', path: '/projetos', icon: ICONS.ecommerce },
      { title: 'Processos', path: '/processos', icon: ICONS.analytics },
      { title: 'Relatórios', path: '/relatorios', icon: ICONS.analytics }
    ],
  },
];

export default sidebarConfig;
