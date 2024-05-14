import { useState, useEffect } from 'react';
// @mui
import { Button, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { styled, useTheme } from '@mui/material/styles';
// hooks
import useResponsive from '../../../hooks/useResponsive';

const RootStyle = styled('div')(({ theme }) => ({
    color: theme.palette.grey[800]
}));

export default function MenuLink() {
    const { pathname } = useLocation();
    const theme = useTheme();
    const [open, setOpen] = useState();
    const navigate = useNavigate();

    const handleOpen = (index) => {
        if(index === 0){
            setOpen([true, false, false, false, false])
            navigate('/rede-social')
        }else if(index === 1){
            setOpen([false, true, false, false, false])
            navigate('/home')
        }else if(index === 2){
            setOpen([false, false, true, false, false])
            navigate('/projetos')
        }else if(index === 3){
            setOpen([false, false, false, true, false])
            navigate('/processos')
        } else if(index === 4){
            setOpen([false, false, false, false, true])
            navigate('/relatorios')
        }
    }

    useEffect(() => {
        setOpen([
            pathname.includes('rede-social'), 
            (pathname.includes('home') && !pathname.includes('rede-social')), 
            pathname.includes('projetos'), 
            pathname.includes('processos'),
            pathname.includes('relatorios')
        ])
    }, [pathname])

    const isDesktop = useResponsive('up', 'lg');
    
    return(
        <RootStyle>
            {isDesktop && (
            <Stack direction="row" spacing={2} sx={{ml:4}}>
                <Button
                    sx={{ backgroundColor: open[0] ? theme.palette.primary.lighter : 'transparent'}} 
                    color={open[0] ? 'primary' : 'inherit'}
                    onClick={() => handleOpen(0)}
                >Início</Button>
                <Button
                    sx={{ backgroundColor: open[1] ? theme.palette.primary.lighter : 'transparent'}} 
                    color={open[1] ? 'primary' : 'inherit'}
                    onClick={() => handleOpen(1)}
                >Minhas Tarefas</Button>
                <Button
                    sx={{ backgroundColor: open[2] ? theme.palette.primary.lighter : 'transparent' }}  
                    color={open[2] ? 'primary' : 'inherit'}
                    onClick={() => handleOpen(2)}
                >Projetos</Button>
                <Button
                    sx={{ backgroundColor: open[3] ? theme.palette.primary.lighter : 'transparent' }}  
                    color={open[3] ? 'primary' : 'inherit'}
                    onClick={() => handleOpen(3)}
                >Processos</Button>
                <Button
                    sx={{ backgroundColor: open[4] ? theme.palette.primary.lighter : "transparent"}}
                    color={open[4] ? "primary" : "inherit"}
                    onClick={() => handleOpen(4)}
                >Relatórios </Button>
            </Stack>
            )}
        </RootStyle>
    )
}