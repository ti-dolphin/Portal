import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

export default function NumberField({label, placeholder, error, helperText, fieldProps, disabled, InputProps}){
    const [value, setValue] = useState(fieldProps.value);

    useEffect(() => {
        setValue(fieldProps.value)
    },[fieldProps.value])

    const onChange = (newValue) => {
        newValue.target.value = newValue.target.value.replace(/[^\d,.?!]/g, '')
        setValue(newValue.target.value)
    }

    const onBlur = (newValue) => {  
        setValue(newValue.target.value)
        fieldProps.onChange(newValue)
    }
    
    return(
        <TextField
            InputProps={InputProps}
            disabled={disabled}
            fullWidth
            label={label}
            placeholder={placeholder}
            type="text"
            {...fieldProps}
            InputLabelProps={{
                shrink: true 
            }}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
        />
    )
}