import { useState, useEffect } from 'react'
import { Card, CardContent, Stack, TextField, MenuItem, Typography, Grid } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptLocale from 'date-fns/locale/pt-BR';
import { useSelector } from '../../redux/store'
import createAvatar from '../../utils/createAvatar';
import MAvatar from '../MAvatar'

export default function Filtro({ callbackFiltro }){
    const [projetos, setProjetos] = useState([]);
    const [responsaveis, setResponsaveis] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [valueProjetos, setValueProjetos] = useState('');
    const [valueResponsaveis, setValueResponsaveis] = useState('');
    const [valueTipos, setValueTipos] = useState('');
    const [valueTitulo, setValueTitulo] = useState('');
    const [valueData, setValueData] = useState(null);
    const [valueStatus, setValueStatus] = useState('Em Andamento');
    const [papeis, setPapeis] = useState([])
    const [valuePapeis, setValuePapeis] = useState('')
    const STATUS = ['Todos', 'Concluído', 'Em Andamento']
    const {processAbaProcessos} = useSelector((state) => state.process) 

    useEffect(() => {
        setOptions()
    },[processAbaProcessos])

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    const ordenaProjetos = (projetosLista) => {
        let auxListaprojetos = [];
        let listaOrdenadaProjetos = new Set();
        projetosLista.forEach((projeto) => {
            projeto = projeto.trim().split("-");
            if (projeto[2] !== undefined) {
                auxListaprojetos.push(projeto[2].trim()); 
            }
        });
        auxListaprojetos = auxListaprojetos.sort();
        auxListaprojetos.forEach((aux) => {
            projetosLista.forEach((proj) => {
                if (proj.includes(aux) && proj !== undefined) {
                    listaOrdenadaProjetos.add(proj)
                }
            });
        })
        return Array.from(listaOrdenadaProjetos);
    }
    
    const setOptions = async () => {
        var papeis = [];
        var projetos = [];
        var responsaveis = [];
        var tipos = [];
        
        processAbaProcessos.forEach((process) => {
            if(!projetos.includes(process.title)){
                projetos.push(process.title)
            }
            
            if(!responsaveis.includes(process.responsavel)){
                responsaveis.push(process.responsavel)
            }
            
            if(!tipos.includes(process.processo)){
                tipos.push(process.processo)
            }

            if(!papeis.includes(process.papel)){
                papeis.push(process.papel)
            }

            if(!papeis.includes(process.papelOriginal)){
                papeis.push(process.papelOriginal)
            }
        })
        
        if (responsaveis) {
            responsaveis = responsaveis.map((resp) => capitalizeFirstLetter(resp));
            responsaveis.sort()
        }

        if (projetos) {
            projetos = ordenaProjetos(projetos)
        }

        if (papeis) {
            papeis.sort()
        }

        if(tipos){
            tipos = tipos.map((tip) => capitalizeFirstLetter(tip));
            tipos.sort()
        }
     

        setPapeis(papeis)
        setProjetos(projetos)
        setResponsaveis(responsaveis)
        setTipos(tipos)
        onChangeFiltro()
    }

    const onChangeFiltro = (novoValor, index) => {
        var values = [
            { index: 'title', valor: index === 'title' ? novoValor : valueProjetos },
            { index: 'responsavel', valor: index === 'responsavel' ? novoValor : valueResponsaveis },
            { index: 'processo', valor: index === 'processo' ? novoValor : valueTipos },
            { index: 'status', valor: index === 'status' ? novoValor : valueStatus },
            { index: 'titulo', valor: index === 'titulo' ? novoValor : valueTitulo },
            { index: 'data_inicio', valor: index === 'data_inicio' ? novoValor : valueData },
            { index: 'papel', valor: index === 'papel' ? novoValor : valuePapeis }
        ];
        
        
        callbackFiltro(values);
    }
    
    return (
        <Card>
            <CardContent>

                <Stack spacing={1} sx={{display:'flex'}}>
                    <Typography variant='h5'>
                        Filtros:
                    </Typography>

                    <Grid container>
                        <Grid item xs={12} md={6} p={1}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label='Projetos'
                                    value={valueProjetos}
                                    onChange={(e) => {setValueProjetos(e.target.value); onChangeFiltro(e.target.value, 'title')}}
                                >
                                    <MenuItem value={''}>
                                        Nenhum
                                    </MenuItem>
                                    {projetos.map((option, index) => (
                                        <MenuItem key={"status_"+index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth   
                                    select
                                    label='Gerente do Projeto'
                                    value={valueResponsaveis}
                                    onChange={(e) => {setValueResponsaveis(e.target.value); onChangeFiltro(e.target.value, 'responsavel')}}
                                >
                                    <MenuItem value={''}>
                                        Nenhum
                                    </MenuItem>
                                    {responsaveis.map((option, index) => (
                                        <MenuItem key={"responsavel_"+index} value={option}>
                                            <Stack direction='row' alignItems='center' spacing={1}>
                                                <MAvatar
                                                    color={createAvatar(option).color}
                                                    sx={{ width: 22, height: 22 }}
                                                >
                                                    {createAvatar(option).name}
                                                </MAvatar>
                                                <Typography>
                                                    {option}
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            

                                <TextField
                                    fullWidth
                                    select
                                    label='Processo'
                                    value={valueTipos}
                                    onChange={(e) => {setValueTipos(e.target.value); onChangeFiltro(e.target.value, 'processo')}}
                                >
                                    <MenuItem value={''}>
                                        Nenhum
                                    </MenuItem>
                                    {tipos.map((option, index) => (
                                        <MenuItem key={"tipo_"+index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    select
                                    label='Papel'
                                    value={valuePapeis}
                                    onChange={(e) => {setValuePapeis(e.target.value); onChangeFiltro(e.target.value, 'papel')}}
                                >
                                    <MenuItem value={''}>
                                        Nenhum
                                    </MenuItem>
                                    {papeis.map((option, index) => (
                                        <MenuItem key={"papel_"+index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Grid>
                        
                        <Grid item xs={12} md={6} p={1}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label='Título'
                                    value={valueTitulo}
                                    onChange={(e) => {setValueTitulo(e.target.value); onChangeFiltro(e.target.value, 'titulo')}}
                                />

                                <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptLocale}>    
                                    <DatePicker
                                        value={valueData}
                                        onChange={(e) => {setValueData(e); onChangeFiltro(e, 'data_inicio')}}
                                        error={false}
                                        helperText={false}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="Data de Início"
                                            />
                                        )}
                                    />
                                </LocalizationProvider> 
                                
                                <TextField
                                    fullWidth
                                    select
                                    label='Status'
                                    value={valueStatus}
                                    onChange={(e) => {setValueStatus(e.target.value); onChangeFiltro(e.target.value, 'status')}}
                                >
                                    {STATUS.map((option, index) => (
                                        <MenuItem key={"status_"+index} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Grid>
                    </Grid>
                    
                </Stack>
            </CardContent>
        </Card>
    )
}