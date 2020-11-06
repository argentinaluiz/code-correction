import React from "react";
import { CssBaseline, MuiThemeProvider, ThemeOptions } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";



const theme: ThemeOptions = {
  palette: {
    type: "dark",
    background: { default: "#303030", paper: "#424242" },
  },
  typography: {
    fontWeightBold: 'bold'
  }
};

function App() {
  return (
    <>
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/" exact={true}>
              teste
            </Route>
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    </>
  );
}

export default App;
