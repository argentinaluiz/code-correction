// @flow
import { Fab, makeStyles } from "@material-ui/core";
import * as React from "react";
import AddIcon from "@material-ui/icons/Add";

type Props = {};

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export const Home = (props: Props) => {
  const classes = useStyles();
  return (
    <div>
      <Fab className={classes.fab}>
        <AddIcon />
      </Fab>
    </div>
  );
};
