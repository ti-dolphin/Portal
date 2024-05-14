import InputMask from 'react-input-mask';
import { TextField } from '@mui/material';

export default function TesteInput({label, placeholder, error, helperText, fieldProps}){

    return(
        <InputMask mask="(99) 99999-9999" maskChar="" {...fieldProps}>
            {(inputProps) => 
                <TextField
                    fullWidth
                    label={label}
                    placeholder={placeholder}
                    {...inputProps}
                    {...fieldProps}
                    error={error}
                    helperText={helperText}
                />
            }
        </InputMask>
    )
}