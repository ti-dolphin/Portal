import { useState, useEffect } from 'react';
import { TextField, MenuItem } from '@mui/material';

export default function SelectFieldObjectWithValue({label, placeholder, error, helperText, options, fieldProps, InputProps, disabled}){

    const onBlur = (newValue) =>{
        fieldProps.onChange(newValue)
    }
    
    return(
        <>
            {fieldProps && fieldProps.value && 
                <TextField
                    InputProps={InputProps}
                    disabled={disabled}
                    select
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    error={error}
                    value={fieldProps.value}
                    onBlur={onBlur}
                    helperText={helperText}
                    {...fieldProps}
                    >
                        {options.map((option, index) => (
                            <MenuItem key={"option_"+index} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                </TextField>
            }
        </>
    )
}