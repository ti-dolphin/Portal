
import { useState } from 'react';
// @mui
import { Container, Grid, Stack, Typography, Fab, Tabs, Tab, Box } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
// components
import Page from '../../components/Page';
import PostsWall from './components/PostsWall';
import Filters from './components/Filters';
import Feed from './components/Feed';
import SideBar from './components/SideBar';
import Iconify from 'src/components/Iconify';
import { isMobile } from 'src/utils/isMobile';
import useRedeSocial from './hooks/RedeSocial.hook';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function RedeSocial() {
  const { redeSocialHook } = useRedeSocial();
  const navigate = useNavigate();
  const [ tabSelected, setTabSelected ] = useState(0)
  const TABS = [
    {value: 0, label: 'Feed'},
    {value: 1, label: 'Atalhos'},
    {value: 2, label: 'Minhas Tarefas'},
  ]

  return (
    <Page title="Rede Social">
      {!isMobile ?
        <Container sx={{width:'960px'}}>
          <Stack maxWidth='960px' direction='column' justifyContent='center' spacing={2}>
            <PostsWall redeSocialHook={redeSocialHook}/>
            <Stack direction='row' spacing={2}>
              <Stack direction='column' sx={{width:'640px'}} justifyContent='center' spacing={2}>
                <Filters redeSocialHook={redeSocialHook}/>
                <Feed redeSocialHook={redeSocialHook}/>
              </Stack>
              <SideBar/>
            </Stack>
          </Stack>
        </Container>
        :
        <TabContext value={tabSelected} sx={{alignItems: 'center'}}>
          <Tabs
              value={tabSelected}
              onChange={(e,newValue) => newValue === 2 ? navigate('/home') : setTabSelected(newValue) }
              variant="scrollable"
              scrollButtons={false}
          >
              {TABS.map((tab, index) => (
                  <Tab 
                    key={tab.value} 
                    label={tab.label} 
                    sx={{'&.Mui-selected': {
                      color: (theme) => theme.palette.primary.darker,
                    }}}
                  />
              ))}
          </Tabs>

          <TabPanel value={0}>
            <Container sx={{mt:2}}>
              <PostsWall redeSocialHook={redeSocialHook}/>
              <Filters redeSocialHook={redeSocialHook}/>
              <Feed redeSocialHook={redeSocialHook}/>
            </Container>
          </TabPanel>

          <TabPanel value={1}>
            <SideBar/>
          </TabPanel>
          
        </TabContext>
      }
      <Fab onClick={() => navigate('/rede-social/new')} sx={{position:'fixed', bottom: '20px', right: isMobile ? '20px' : 'calc(100% - 1100px)'}}>
        <Iconify icon={'carbon:add'} width={30} height={30}/>
      </Fab>
    </Page>
  );
}
