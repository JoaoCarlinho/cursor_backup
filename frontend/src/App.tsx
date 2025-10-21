// App.tsx
import React, { useEffect } from 'react'
import { useActions, useValues } from 'kea'
import { counterLogic } from './AppLogic';

import { io } from "socket.io-client";
// export const socket = io("http://backend:5005"); // Flask-SocketIO default port
export const socket = io("http://localhost:5005"); // Flask-SocketIO default port


import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import OnePage from './components/OnePage';

function ApiChecker() {
  const { fetchData } = useActions(counterLogic);
  const { error, loading, flaskAvailabilityData } = useValues(counterLogic);

  useEffect(() => {
    if (  loading != true && loading != 'complete' && loading != 'failed' ){
      fetchData();
    }
  }, [loading]);

  if (error) {
    return <p>Error: {typeof error === 'object'? JSON.stringify(error, null, 2): error}</p>;
  }

  return (
    <Button color="inherit">{typeof flaskAvailabilityData === 'object'
        ? JSON.stringify(flaskAvailabilityData, null, 2)
        : flaskAvailabilityData}</Button>
  );
}

function App() {
  return (
    <Container 
      sx={{ 
        alignItems: "center",
        // display: "flex",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <React.Fragment>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Models
              </Typography>
              <ApiChecker/>
              <Button color="inherit">Login</Button>
            </Toolbar>
          </AppBar>
        </Box>
        <Typography variant="h1" sx={{ my:4, textAlign: 'center', color: 'primary.main' }}>
          GenAI playground
        </Typography>
        <Typography variant="h2">Models</Typography>
        <OnePage/>
      </React.Fragment>
    </Container>
  );
}

export default App;