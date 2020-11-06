import React from 'react';
import logo from './logo.svg';
import './App.css';
import {CssBaseline, MuiThemeProvider} from '@material-ui/core';
import {BrowserRouter} from 'react-router';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <Box paddingTop={'70px'}>
           <Breadcrumbs/>
           <AppRouter/>
          </Box>
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;
