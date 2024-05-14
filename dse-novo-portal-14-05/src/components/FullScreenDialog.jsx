import { 
        Box,
        Dialog,
        Slide,
        AppBar, 
        Toolbar,
        IconButton,
        Container
        } from '@mui/material';
import { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';


const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FullScreenDialog({handleClose, children, open}){
    return(
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar position="relative">
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={() => handleClose()}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box mb={2}/>
                <Container sx={{height: '100%'}}>
                    {children}
                </Container>
        </Dialog>
    )
}