// @flow
import { gql, useQuery } from "@apollo/client";
import { makeStyles } from "@material-ui/core";
import * as React from "react";
type Props = {};

const useStyles = makeStyles((theme) => ({
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    }
}));

export const Home = (props: Props) => {
  
  return <div>
      <Fab aria-label={fab.label} className={fab.className} color={fab.color}>
            {fab.icon}
          </Fab>
  </div>;
};
