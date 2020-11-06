import React from 'react';
import {CssBaseline, MuiThemeProvider, Switch, Theme, ThemeOptions} from '@material-ui/core';
import {BrowserRouter, Switch} from 'react-router-dom';

function App() {
  const theme : ThemeOptions = {
    palette: {type: 'dark'}
  }
  return (
    <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <Switch>
            <Route path="/about" exact={true}>
              <About />
            </Route>
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
  );
}

export default App;
