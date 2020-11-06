import React from "react";
import { createMuiTheme, CssBaseline, MuiThemeProvider, ThemeOptions } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Home } from "./pages/Home";
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

const theme: ThemeOptions = createMuiTheme( {
  palette: {
    type: "dark",
    background: { default: "#303030", paper: "#424242" },
  },
});

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
  resolvers: {
    JSONObject: {
      serialize: (parsed: any) => {
        console.log('asdfsd');
        return parsed
      },
      parseValue: (raw: any) => {
        console.log('asdfasdf')
        return raw
      }
    }
  }
});

function App() {
  return (
    <ApolloProvider client={client} >
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route path="/" exact={true} component={Home}/>
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    </ApolloProvider>
  );
}

export default App;
