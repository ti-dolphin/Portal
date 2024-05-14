import { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import { TextField } from '@mui/material';
import { CEP_MASK } from './Masks'

export default function CepField({label, placeholder, error, helperText, fieldProps, disabled, InputProps}){
    const [value, setValue] = useState(fieldProps.value);

    useEffect(()=>{
        setValue(fieldProps.value)
    },[fieldProps.value])

    const onChange = (newValue) =>{
        setValue(newValue.target.value)
    }

    const onBlur = (newValue) =>{
        setValue(newValue.target.value)
        fieldProps.onChange(newValue)
    }

    return(
        <InputMask mask={CEP_MASK} maskChar="" {...fieldProps} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}} value={value} onChange={onChange} onBlur={onBlur}>
            {(inputProps) => 
                <TextField
                    InputProps={InputProps}
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    {...inputProps}
                    InputLabelProps={{
                        shrink: true 
                    }}
                    error={error}
                    helperText={helperText}
                />
            }
        </InputMask>
    )
}