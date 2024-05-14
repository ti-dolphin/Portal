import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import useStyles from '../../../DetalheAcordeaoCampo.style';


/**
 * @param {string} value valor do seletor
 * @param {string} id id do campo de seleção
 * @param {string} title campos a serem consultados
 * @param {string} label etiqueta a ser exibida no campo
 * @param {Boolean} label etiqueta a ser exibida no campo
 * @param {object[]} dados[] array de opções a serem exibidas
 * @param {function[]} callback função de callback
 * 
**/
export default function CustomSelector(props) {
    const classes = useStyles()

    return (
    <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel htmlFor={props.id}>{props.label}</InputLabel>

        <Select
            native
            value={props.value}
            onChange={(event)=>props.callback(event.target.value)}
            label={props.label}
            inputProps={{
                name: props.label,
                id: props.id,
            }}
        >
            <option aria-label="None" value="" />
            {props.dados.map((element, index) => {
                return(
                    <option key={index}>{element}</option>
                )
            })}
        </Select>
    </FormControl>
    )
}