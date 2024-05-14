import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Badge(theme: Theme) {
  return {
    MuiBadge: {
      styleOverrides: {
        dot: {
          width: 10,
          height: 10,
          borderRadius: '50%'
        },
        colorSuccess:{
          color: theme.palette.grey[0],
          backgroundColor: theme.palette.success.dark,
        }
      }
    }
  };
}
