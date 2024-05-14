import { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import { TextField } from '@mui/material';

export default function CustomMaskField({label, placeholder, error, helperText, mask, fieldProps, disabled, InputProps}){
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
        <InputMask mask={mask} maskChar="" {...fieldProps} value={value} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}} onChange={onChange} onBlur={onBlur}>
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