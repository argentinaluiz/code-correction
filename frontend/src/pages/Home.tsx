// @flow
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Fab,
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import AddIcon from "@material-ui/icons/Add";
import { NewCorrectionDialog } from "../components/NewCorrectionDialog";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import update from "immutability-helper";
import io from "socket.io-client";

type Props = {};

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const CORRECTIONS = gql`
  query {
    corrections {
      name
      meta
      created_at
    }
  }
`;

const GET_CORRECTION = gql`
  query GetGreeting($date: String!) {
    getCorrection(date: $date) {
      content
    }
  }
`;

const socket = io("http://localhost:3000");

export const Home = (props: Props) => {
  const classes = useStyles();

  const { loading, error, data } = useQuery(CORRECTIONS);
  const [getCorrection, { data: data1 }] = useLazyQuery(GET_CORRECTION);
  const [corrections, setCorrections] = React.useState<any[]>([]);
  console.log(data1);

  socket.on("correction.finished", (date: string) => {
    const correctionIndex = corrections.findIndex(
      (correction: any) => correction.created_at === date
    );
    setCorrections(
      update(corrections, {
        [correctionIndex]: {
          $set: { ...corrections[correctionIndex], status: "finished" },
        },
      })
    );
  });
  React.useEffect(() => {
    return () => {
      socket.off("correction.finished");
    };
  }, []);

  React.useEffect(() => {
    if (data && data.corrections && data.corrections.length) {
      setCorrections(data.corrections);
    }
  }, [data]);

  const [openCorrectionDialog, setCorrectionDialog] = React.useState(false);
  return (
    <>
      <Typography variant="h5">Correções</Typography>
      <Grid container>
        <Grid item xs={6}>
          <List>
            {corrections.map((correction: any, key: number) => (
              <ListItem key={key}>
                <Card>
                  <CardHeader
                    avatar={
                      correction.status === "running" ? (
                        <CircularProgress />
                      ) : (
                        "finished"
                      )
                    }
                    title={correction.name}
                  />
                  <CardContent>
                    <Typography color="textSecondary">
                      {correction.created_at}
                    </Typography>
                    <Typography variant="body2" component="p">
                      {JSON.stringify(correction.meta)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      onClick={() =>
                        getCorrection({
                          variables: { date: correction.created_at },
                        })
                      }
                    >
                      Ver log
                    </Button>
                  </CardActions>
                </Card>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={6} style={{ overflow: "auto",maxHeight: '1000px'}}>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {data1?.getCorrection?.content}
          </pre>
        </Grid>
      </Grid>
      <Fab className={classes.fab} onClick={() => setCorrectionDialog(true)}>
        <AddIcon />
      </Fab>
      <NewCorrectionDialog
        open={openCorrectionDialog}
        onClose={(result) => {
          if(result){
            setCorrections((prevState) => [result, ...prevState]);

          }
          setCorrectionDialog(false);
        }}
      />
    </>
  );
};
