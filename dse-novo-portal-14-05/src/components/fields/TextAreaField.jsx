import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

export default function TextAreaField({label, disabled, placeholder, error, helperText, fieldProps, InputProps, type}){
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
            multiline
            rows={5}
            InputProps={InputProps}
            disabled={disabled}
            fullWidth
            label={label}
            type={type}
            placeholder={placeholder}
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