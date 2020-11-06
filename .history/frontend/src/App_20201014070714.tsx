import React from 'react';
import {CssBaseline, MuiThemeProvider, ThemeOptions} from '@material-ui/core';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

function App() {
  const theme : ThemeOptions = {
    palette: {type: 'dark'}
  }
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <Switch>
            <Route path="/" exact={true}>
              teste
            </Route>
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;
