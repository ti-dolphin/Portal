import { Dialog, DialogTitle, DialogContent, Typography, Stack, Button, Box} from '@mui/material';

export default function ConfirmAlert({open, setOpen, title, subtitle, callbackConfirm, callbackDecline}) {

    return(
        <Dialog open={open} onClose={()=>setOpen(false)} maxWidth='sm'>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography variant='body1'>{subtitle}</Typography>
                <Box mb={3}/>
                <Stack direction='row' spacing={1}>
                    <Button variant='contained' onClick={() => callbackConfirm()}>
                        Sim
                    </Button>

                    <Button variant='contained' onClick={() => callbackDecline()}>
                        Não
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}