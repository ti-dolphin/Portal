import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { 
    TextField, 
    InputAdornment,
    IconButton
   } from '@mui/material';

export default function SearchInput({callback, label, live, idCategoria, sx, helperText, error }){
    const [search, setSearch] = useState('')

    useEffect(()=>{
        setSearch('');
    },[idCategoria])

    useEffect(()=>{
        if(live){
            callback(search)
        } 
    },[search])

    return (
        <TextField
            {...sx}
            fullWidth
            label={label}
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
            helperText={helperText}
            error={error}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={()=>callback(search)}>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
            )}}
        />
    )
}