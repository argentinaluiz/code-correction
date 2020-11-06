import React from 'react';
import logo from './logo.svg';
import './App.css';
import {MuiThemeProvider} from '@material-ui/core';
function App() {
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <Navbar/>
          <Box paddingTop={'70px'}>
           <Breadcrumbs/>
           <AppRouter/>
          </Box>
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;
