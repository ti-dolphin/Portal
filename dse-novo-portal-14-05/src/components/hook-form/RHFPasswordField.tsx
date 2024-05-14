// form
import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Iconify from '../../components/Iconify';
import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';

// ----------------------------------------------------------------------

interface IProps {
  name: string;
}

export default function RHFPasswordField({ name, ...other }: IProps & TextFieldProps) {
  const { control } = useFormContext();
  const [ showPassword, setShowPassword ] = useState(false);


  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField 
            type={showPassword ? 'text' : 'password'} 
            {...field} 
            fullWidth 
            error={!!error} 
            helperText={error?.message} 
            {...other}
            InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
        
        />
      )}
    />
  );
}