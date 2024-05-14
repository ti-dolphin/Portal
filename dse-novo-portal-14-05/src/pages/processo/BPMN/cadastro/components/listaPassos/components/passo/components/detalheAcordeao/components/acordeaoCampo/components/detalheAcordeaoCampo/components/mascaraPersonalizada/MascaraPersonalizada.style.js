import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: '100%'
    },
    btnCadastrarMascara: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      '&:hover': {
          backgroundColor: '#28a745',
          borderColor: '#28a745',
       }
    },
    gridItembtnCadastrarMascara: {
      marginTop: '20px',
      [theme.breakpoints.down('md')]: {
        marginTop: '0px',
        textAlign: 'center'
      }
    }
  }));

export default useStyles