import React from 'react';
import logo from './logo.svg';
import './App.css';
import {CssBaseline, MuiThemeProvider} from '@material-ui/core';
import {BrowserRouter} from 'react-router-dom';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;
