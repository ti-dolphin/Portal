import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
    width: '100%'
  },
  card:{  //Classe que controla o conteúdo da card
    padding: '15px',
    borderRadius: '7px',
    textAlign: 'center',
    marginBottom: '10px'
  },
  campo:{ //Classe para ajudar a alinhar os elementos
    display:'flex',
    flexDirection:'row'
  },
  campoDescricao: {
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
  gridItemCampoAvancado : {
    paddingTop: '24px'
  },
  gridItembtnAdicionarCampo: {
    paddingTop: '24px',
    textAlign: 'center'
    // [theme.breakpoints.down('xs')]: {
    //   marginTop: '0px',
    //   marginBottom: '24px',
    //   textAlign: 'center'
    // }
  },
  switchCampoObrigatorio: {
    paddingBottom: '12px'
  }
}));

export default useStyles