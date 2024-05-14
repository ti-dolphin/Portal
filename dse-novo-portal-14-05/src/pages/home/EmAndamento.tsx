import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Typography, Box, Tab, Tabs, Grid, ButtonGroup, Button, Stack, IconButton, OutlinedInput, InputAdornment, Skeleton, Card, CardContent } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import searchFill from '@iconify/icons-eva/search-fill';
import Avatar from '../../components/Avatar'
// components
import ProcessList from '../../components/home/ProcessList';
import { useDispatch, useSelector } from '../../redux/store';
import { getProcessHome } from '../../redux/slices/process'


const RootStyle = styled('div')(({ theme }) => ({
    marginBottom: '100px',
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 220,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': { width: 250, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));
  

export default function EmAndamento() {
    const [filterSearch, setFilterSearch] = useState('');
    const [processState, setProcessState] = useState([]);
    const [value, setValue] = useState('0');
    const [view, setView] = useState('List');
    const theme = useTheme();
    const dispatch = useDispatch();
    const { processHome, isLoading } = useSelector((state) => state.process);
  
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
      setValue(newValue);
    };

    useEffect(()=>{
      dispatch(getProcessHome())
    },[])

    useEffect(() => {
      setFilterSearch('')
      setProcessState(processHome)
    },[value])

    useEffect(()=>{
      setProcessState(processHome)
    },[processHome])

    const filterProcess = (search: any) => {
      setFilterSearch(search)
      if(search && search != ''){
        var processHomeAux = JSON.parse(JSON.stringify(processHome)) 
          var filtered = processHome[value].data.filter((process) => {
              var verify = false
              Object.keys(process).map((key) => {
                if(process[key] && process[key].toString().toLowerCase().indexOf(search.toLowerCase()) !== -1){
                    verify = true
                }
              })
              
              if(verify){
                return process
              }

          })
          processHomeAux[value].data = filtered;
          setProcessState(processHomeAux)
      } else{
        setProcessState(processHome)
      }
  }

    return (
        <RootStyle>

            <Grid container spacing={3}>

              <Grid item xs={12} md={6}>
                <Typography variant='h3'>
                    Meus Processos
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} sx={{display:'flex', justifyContent: {md:'flex-end', xs:'start'}, overflow:'auto' }}>

              <Stack direction='row' spacing={2}>

              <SearchStyle
                    value={filterSearch}
                    onChange={(e) => filterProcess(e.target.value)}
                    placeholder="Pesquisar Processo"
                    startAdornment={
                        <InputAdornment position="start">
                            <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    }
                />

                <IconButton sx={{width:'15%'}}>
                  <MoreVertIcon/>
                </IconButton>

                <ButtonGroup sx={{borderRadius:3}}>
                  <Button color='inherit' sx={{backgroundColor: view === 'Grid' ? theme.palette.grey[400] : null}} onClick={() => setView('Grid')}>
                    <ViewModuleIcon />
                  </Button>
                  <Button color='inherit' sx={{backgroundColor: view === 'List' ? theme.palette.grey[400] : null}} onClick={() => setView('List')}>
                    <ViewListIcon />
                  </Button> 
                </ButtonGroup>
              </Stack>

              </Grid>

            </Grid>

            <Box mb={2}/>

            <Box sx={{ width: "100%" }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider"}}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="scrollable"
                        scrollButtons={false}
                    >
                        {processHome.map((tab, index) => (
                            <Tab key={tab.value} label={tab.label} icon={ tab.data.length > 0 ?
                              <Avatar sx={{backgroundColor:value === String(index) ? (theme) => theme.palette.success.light : (theme) => theme.palette.grey[400], width:15, height:15}}>
                                <Typography variant='caption' sx={{color: value === String(index) ? (theme) => theme.palette.success.dark : (theme) => theme.palette.grey[600]}}>
                                  {tab.data.length}
                                </Typography>
                              </Avatar>
                              :
                              null
                            } iconPosition="end" value={String(index)} />
                        ))}
                    </Tabs>
                </Box>

                {isLoading ?
                  <>
                    {view === 'List' ?
                      <>
                        <Box mb={2}/>
                        <Skeleton variant='rectangular' sx={{borderRadius: 2, minWidth: '100%', minHeight: '250px',}}/>
                      </>
                      :
                      <>
                        <Box mb={2}/>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6} lg={4}> 
                              <Skeleton variant='rectangular' sx={{borderRadius: 2, minWidth: '100%', minHeight: '250px',}}/>
                            </Grid>
                            <Grid item xs={12} md={6} lg={4}> 
                              <Skeleton variant='rectangular' sx={{borderRadius: 2, minWidth: '100%', minHeight: '250px',}}/>
                            </Grid>
                            <Grid item xs={12} md={6} lg={4}> 
                              <Skeleton variant='rectangular' sx={{borderRadius: 2, minWidth: '100%', minHeight: '250px',}}/>
                            </Grid>
                        </Grid>
                      </>
                    }
                  </>
                  :
                  <>
                    {processState.map((panel, index) => (
                      <TabPanel key={panel.value} value={String(index)}>
                        <Box mb={2}/>
                        {panel.data.length > 0 ?
                            <ProcessList data={panel.data} acompanhando={true} view={view}/>
                            :
                            <Card>
                                <CardContent>
                                    <Typography variant='h5'>
                                        Você não tem processos para serem mostrados nesta aba
                                    </Typography>
                                </CardContent>
                            </Card>
                        }
                      </TabPanel>
                    ))}
                  </>
                }


                </TabContext>
            </Box>
        </RootStyle>
    );
  }