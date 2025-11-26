import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ED64',
    },
    secondary: {
      main: '#FF5C93',
    },
    background: {
      default: '#050810',
      paper: '#0B101A',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 18,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
  },
});

export default theme;
