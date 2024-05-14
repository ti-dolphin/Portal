import { useState, useEffect } from 'react';
import { TextField, MenuItem} from '@mui/material';

export default function SelectFieldPastasFilhas({label, placeholder, error, helperText, options, fieldProps, InputProps, disabled, onClick}){
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
            disabled={disabled}
            select
            fullWidth
            label={label}
            placeholder={placeholder}
            error={error}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            helperText={helperText}
            {...fieldProps}
            >
                {options.map((option, index) => (
                    <MenuItem key={"option_"+index} value={option.value} onClick={() => onClick(option.value)}>
                        {option.label}
                    </MenuItem>
                ))}
        </TextField>    
    )
}