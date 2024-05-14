import { TextField, Stack, Typography, Card, CardContent, InputAdornment, IconButton } from "@mui/material"
import { useState, useEffect } from 'react';
import Iconify from '../../../components/Iconify';


type Props = {
    redeSocialHook: any;
}

export default function Filter({redeSocialHook}: Props){
    const [ filter, setFilter ] = useState('')

    useEffect(() =>{
        setFilter(redeSocialHook.filter)
    },[redeSocialHook.filter])

    const removeFilter = () => {
        setFilter('');
        redeSocialHook.setFilter('');
        redeSocialHook.handleFilter('');
    }

    const onSearch = () => {
        redeSocialHook.setFilter(filter);
        redeSocialHook.handleFilter(filter);
    }

    const handleKeyPress = (event: any) => {
        if(event.key === 'Enter' && filter && filter !== ''){
            event.target.blur();
            onSearch()
        }
    }

    return(
        <Card sx={{backgroundColor: (theme) => theme.palette.grey[200], boxShadow: 'none', mb: 2}}>
            <CardContent>
                <Stack spacing={1} sx={{overflow:'auto'}}>
                    <Stack direction= {'column'} sx={{p: 1}} spacing={2}>
                        <TextField
                            label={"Pesquisar"}
                            value={filter}
                            onChange={(e) => (e.target.value && e.target.value !== '') ? setFilter(e.target.value) : removeFilter()}
                            onKeyPress={(event) => handleKeyPress(event)}
                            InputProps={{
                                endAdornment: (
                                    <Stack direction='row' spacing={1}>
                                        {(filter && filter !== '') &&
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => removeFilter()} edge="end">
                                                <Iconify icon={'ep:close'} />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => onSearch()} edge="end">
                                            <Iconify icon={'ant-design:search-outlined'} />
                                            </IconButton>
                                        </InputAdornment>
                                    </Stack>
                                ),
                                }}
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>        
    )
}