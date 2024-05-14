// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// utils
import cssStyles from '../../../utils/cssStyles';
import { GetSession } from '../../../session';
// config
import {
  // MENU_NAVBAR_WIDTH,
  // MENU_NAVBAR_COLLAPSE_WIDTH,
  MENU_HEADER_MOBILE,
  MENU_HEADER_DESKTOP
} from '../../../config';
// components
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
import Logo from '../../../components/Logo';
//
// import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
// import LanguagePopover from './LanguagePopover';
// import ContactsPopover from './ContactsPopover';
import NotificationsPopover from './NotificationsPopover';
import ConfigPopover from './ConfigPopover';
import MenuLink from './MenuLink';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'


// ----------------------------------------------------------------------

type RootStyleProps = {
  isCollapse: boolean | undefined;
};

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse'
})<RootStyleProps>(({ isCollapse, theme }) => ({
  boxShadow: 'none',
  ...cssStyles(theme).bgBlur(),
  transition: theme.transitions.create('width', {
    duration: theme.transitions.duration.shorter
  }),
  [theme.breakpoints.up('lg')]: {
    // width: `calc(100% - ${MENU_NAVBAR_WIDTH + 1}px)`,
    // ...(isCollapse && {
    //   width: `calc(100% - ${MENU_NAVBAR_COLLAPSE_WIDTH}px)`
    // })
  }
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: MENU_HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(0, 5),
    minHeight: MENU_HEADER_DESKTOP
  }
}));

// ----------------------------------------------------------------------

type Props = {
  onOpenSidebar: VoidFunction;
};

export default function MenuHeader({ onOpenSidebar }: Props) {
  const { isCollapse } = useCollapseDrawer();
  const usuario = GetSession("@dse-usuario")
  const isDesktop = useResponsive('up', 'lg');
  const navigate = useNavigate();

  return (
    <RootStyle isCollapse={isCollapse}>
      <ToolbarStyle>
      
        {!isDesktop && (
          <Stack direction="row">
            <IconButtonAnimate onClick={() => onOpenSidebar()} sx={{ mr: 1, color: 'text.primary' }}>
              <Iconify icon="eva:menu-2-fill" />
            </IconButtonAnimate>

            <IconButton aria-label="delete" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
          </Stack>
        )}

        {/* <Searchbar /> */}
        {isDesktop&&(<Logo primary sx={{width:100, height:'100%'}}/>)}
        
        <MenuLink/>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          {/* <LanguagePopover /> */}
          {usuario.tipo === 'Administrador' && <ConfigPopover/>}
          <NotificationsPopover />
          {/* <ContactsPopover /> */}
          <AccountPopover />
        </Stack>

      </ToolbarStyle>
    </RootStyle>
  );
}
