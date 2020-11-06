import React from 'react';
import {CssBaseline, MuiThemeProvider, Switch, Theme, ThemeOptions} from '@material-ui/core';
import {BrowserRouter} from 'react-router-dom';

function App() {
  const theme : ThemeOptions = {
    palette: {type: 'dark'}
  }
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <Switch>
            
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;