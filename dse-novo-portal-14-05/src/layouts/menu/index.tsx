import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
// hooks
import useCollapseDrawer from '../../hooks/useCollapseDrawer';
// config
import {
  MENU_NAVBAR_WIDTH,
  MENU_HEADER_MOBILE,
  MENU_HEADER_DESKTOP,
  MENU_NAVBAR_COLLAPSE_WIDTH,
} from '../../config';
//
import MenuHeader from './header';
import MenuNavbar from './navbar';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    display: 'flex',
    minHeight: '100%',
  },
}));

type MainStyleProps = {
  collapseClick: boolean;
};

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})<MainStyleProps>(({ collapseClick, theme }) => ({
  flexGrow: 1,
  paddingTop: MENU_HEADER_MOBILE + 24,
  paddingBottom: MENU_HEADER_MOBILE + 24,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: MENU_HEADER_DESKTOP + 24,
    paddingBottom: MENU_HEADER_DESKTOP + 24,
    width: `calc(100% - ${MENU_NAVBAR_WIDTH}px)`,
    transition: theme.transitions.create('margin-left', {
      duration: theme.transitions.duration.shorter,
    }),
    ...(collapseClick && {
      marginLeft: MENU_NAVBAR_COLLAPSE_WIDTH,
    }),
  },
}));

// ----------------------------------------------------------------------

export default function MenuLayout() {
  const { collapseClick } = useCollapseDrawer();

  const [open, setOpen] = useState(false);

  return (
    <RootStyle>
      <MenuHeader onOpenSidebar={() => setOpen(true)} />

      <MenuNavbar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />

      <MainStyle collapseClick={collapseClick}>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
