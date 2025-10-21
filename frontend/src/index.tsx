// index.tsx
import ReactDOM from 'react-dom/client';
import { resetContext } from 'kea'
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material';


resetContext({
  plugins: [
    // additional kea plugins
  ],
})

const theme = createTheme({
  palette: {
    primary: {
      main: "#013e87"
    },
    secondary: {
      main: "#2e74c9"
    }
  },
  typography: {
    h1: {
      fontSize: "3rem",
      fontWeight: 600,
    }
  }
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
      
);