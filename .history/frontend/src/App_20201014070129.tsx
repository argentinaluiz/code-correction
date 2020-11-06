import React from 'react';
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
