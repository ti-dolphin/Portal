import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog(props) {

  const handleClose = () => {
    props.fechamodal()
  };

  return (
    <Dialog 
        open={props.show} 
        onClose={handleClose}
        maxWidth={props.maxWidth}
        fullWidth
    >
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
            {props.children}
        </DialogContent>
    </Dialog>
  );
}