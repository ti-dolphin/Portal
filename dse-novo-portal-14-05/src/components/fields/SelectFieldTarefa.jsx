import { useState, useEffect } from 'react';
import { TextField, MenuItem, FormControl, FormControlLabel, RadioGroup, Radio, Stack, Typography } from '@mui/material';

export default function SelectFieldTarefa({label, placeholder, error, helperText, options, fieldProps, InputProps, disabled}){
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
        <>
        {options.length > 3 ?
            <>
                {value !== undefined &&
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
                                <MenuItem key={"option_"+index} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                    </TextField>
                }
            </>
            :
            <>
            {value !== undefined &&
                <Stack spacing={2} sx={{ml:1}}>
                    <Typography variant='subtitle2' sx={{color:(theme) => theme.palette.grey[600]}}>
                        {label}
                    </Typography>
                    <FormControl component="fieldset" disabled={disabled}>
                        <RadioGroup row  spacing={2} onChange={onBlur} value={value} {...fieldProps} >
                            {options.map((option)=>
                                <FormControlLabel
                                    value={option.value}
                                    label={option.label}
                                    labelPlacement="end"
                                    control={<Radio />}
                                />
                            )
                            }
                        </RadioGroup>
                    </FormControl>
                    {error && 
                        <Typography variant='subtitle2' color='error'>
                            Selecione uma opção
                        </Typography>
                    }           
                </Stack>
            }
            </>
        }
        </>
    )
}