import React from 'react';
import Switch from '@material-ui/core/Switch';
import useStyles from '../../../DetalheAcordeaoCampo.style';

/**
 * @param {String} name Nome do switch.
 * @param {Boolean} state Estado que corresponderá ao switch.
 * @param {String} label Texto que irá aparecer ao lado do switch.
 * @param {function()} callback Função de callback do componente.
 * @param {String} color *Opcional* Define a cor do switch.
 * @returns 
 */

export default function CustomSwitchField(props) {

  const handleChange = (event) => {
    props.callback(event.target.checked)
  };

  const classes = useStyles();

  return (
    <div className={classes.switchCampoObrigatorio}>
        <span>{props.label}</span>
        <Switch
            checked= {props.state}
            onChange= {handleChange}
            name= {props.name}
            color= {props.color ? props.color : "primary"}
        />
    </div>
  );
}
