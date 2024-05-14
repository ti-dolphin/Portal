import { useEffect, useState } from 'react'
import { TextField } from '@mui/material';
import InputMask from 'react-input-mask';
import { Money } from '../../utils/utils'

export default function MoneyField({label, placeholder, error, helperText, fieldProps, disabled}){
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
        <InputMask maskChar="" {...fieldProps} value={value} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}} onChange={onChange} onBlur={onBlur}>
            {(inputProps) => 
                <TextField
                    fullWidth
                    value={value}
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