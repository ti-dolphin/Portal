import { Typography, Stack, Box, Tooltip } from '@mui/material';
import Label from '../Label';

export default function Title({title, subtitle}){

    return (
        <Stack spacing={1} display='flex'>
            <Stack direction='row' spacing={1}>
                <Tooltip title={title} sx={{justifyContent: 'flex-start', display: '-moz-initial', justifyItems: 'flex-start', left: 0}}>
                    <Typography variant='h4'>
                        {title.length > 50 ? title.substring(0, 50) +'...' : title}
                    </Typography>
                </Tooltip>
                <Box flexGrow={1}/>        
            </Stack>
            <Stack spacing={1} direction='row'>
                <Label variant='filled'>
                    {subtitle}
                </Label>
                <Box flexGrow={1}/>
            </Stack>
        </Stack>
    )
}