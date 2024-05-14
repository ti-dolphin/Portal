import { Grid, Typography, Button, Stack, Fab } from '@mui/material';
import { useTheme } from '@mui/material/styles'
import Avatar from './Avatar'

export default function Header({title, subtitle, buttons, options, image,}){

    const theme = useTheme()

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {image && <Avatar sx={{width: 50, height: 50}} src={image}/> }
                    <Stack>
                        <Typography variant="caption" sx={{color: theme.palette.grey[500]}}>{subtitle.toUpperCase()}</Typography>
                        <Typography variant="h4">{title}</Typography>
                    </Stack>
                </Stack>
            </Grid>
            {
                buttons && 
                    <Grid item xs={12} md={6} sx={{display:'flex', justifyContent: {md:'flex-end', xs:'start'}, overflow:'auto', pb:2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">

                            {
                                options && options.map((option,index) => (
                                    <Fab key={'IconButtonOption_'+index} onClick={() => option.callback()} sx={{backgroundColor: option.active ? (theme) => theme.palette.primary : (theme) => theme.palette.primary.lighter}}>
                                        {/* sx={{boxShadow: (theme) => theme.customShadows.z12, backgroundColor: option.active ? (theme) => theme.palette.grey[300] : (theme) => theme.palette.grey[0]}} */}
                                        <Stack alignItems="center">
                                            {option.image}
                                        </Stack>
                                    </Fab>
                                ))
                            }

                            {buttons.map((button) => (
                                <Button key={"button_"+button.text} variant="contained" onClick={() => button.callback()} sx={{maxHeight: 50, boxShadow: theme.customShadows.z8}}> {button.text.toUpperCase()} </Button>
                            ))}
                        </Stack>
                    </Grid>
            }
        </Grid>
    )
}