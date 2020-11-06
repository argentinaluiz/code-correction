import React from "react";
import { createMuiTheme, CssBaseline, MuiThemeProvider, ThemeOptions } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const theme: ThemeOptions = createMuiTheme( {
  palette: {
    type: "dark",
    background: { default: "#303030", paper: "#424242" },
  },
});

const client = new ApolloClient({
  uri: 'http://localhost:3000',
  cache: new InMemoryCache()
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
