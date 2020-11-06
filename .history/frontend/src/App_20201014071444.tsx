import React from "react";
import { createMuiTheme, CssBaseline, MuiThemeProvider, ThemeOptions } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";



const theme: ThemeOptions = createMuiTheme( {
  palette: {
    type: "dark",
    background: { default: "#303030", paper: "#424242" },
  },
});

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
