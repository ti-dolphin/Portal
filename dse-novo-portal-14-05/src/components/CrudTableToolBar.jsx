import { Icon } from '@iconify/react';
import { Grid, Typography, Box, OutlinedInput, InputAdornment, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import searchFill from '@iconify/icons-eva/search-fill';

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
    width: 240,
    transition: theme.transitions.create(['box-shadow', 'width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter
    }),
    '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
    '& fieldset': {
      borderWidth: `1px !important`,
      borderColor: `${theme.palette.grey[500_32]} !important`
    }
  }));

export default function CrudTableToolBar({name, filterName, onFilterName, createCallback}){

    return(
        
        <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={6}>
                <Typography variant='h5'>
                    {name}
                </Typography>
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display:'flex', justifyContent: {sm:'flex-end', xs:'flex-start'} }}>
                <SearchStyle
                    value={filterName}
                    onChange={(e) => onFilterName(e.target.value)}
                    placeholder="Pesquisa"
                    startAdornment={
                        <InputAdornment position="start">
                            <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    }
                />
                <Box mr={2}/>
                <Tooltip title='Adicionar'>
                    <IconButton onClick={() => createCallback()}>
                        <AddIcon size='large' sx={{width:'40px'}}/>
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
       
    )
}