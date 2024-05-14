import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

export default function DateField({label, placeholder, error, helperText, fieldProps, disabled, InputProps}){
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
        <TextField
            InputProps={InputProps}
            fullWidth
            label={label}
            disabled={disabled}
            placeholder={placeholder}
            type="date"
            InputLabelProps={{
                shrink: true
            }}
            {...fieldProps}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
        />
    )
}