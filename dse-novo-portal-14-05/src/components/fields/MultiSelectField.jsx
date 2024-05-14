import { useState, useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';

export default function MultiSelectField({label, placeholder, error, helperText, fieldProps, options, disabled}){
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

        <Autocomplete
            disabled={disabled}
            fullWidth
            options={options}
            getOptionLabel={(option) => option.label}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.value === value.value}
            defaultValue={value}
            onChange={onChange}
            // onInputChange={onChange}
            onBlur={onBlur}
            // {...fieldProps} 
            renderInput={(params) => (
                <TextField
                    error={error}
                    helperText={helperText}
                    // onBlur={onBlur}
                    // onChange={onChange}
                    // onInputChange={onChange}
                    {...fieldProps} 
                    {...params} 
                    label={label} 
                    placeholder={placeholder}
                />
            )}
        />
    )
}