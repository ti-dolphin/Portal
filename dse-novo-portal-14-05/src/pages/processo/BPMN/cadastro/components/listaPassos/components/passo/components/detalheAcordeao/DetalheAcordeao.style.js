import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
      // margin: theme.spacing(1),
      marginBottom:'16px',
      minWidth: 120,
      width: '100%'
    },
    btnAdicionarCampo: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      '&:hover': {
          backgroundColor: '#28a745',
          borderColor: '#28a745',
       }
    },
    gridItembtnAdicionarCampo: {
      marginTop: '24px',
      [theme.breakpoints.down('xs')]: {
        marginTop: '0px',
        marginBottom: '24px',
        textAlign: 'center'
      }
    }
  }));

export default useStyles