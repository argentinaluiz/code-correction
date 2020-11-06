import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";
import { useState } from "react";
import { gql, useQuery } from "@apollo/client";

export interface NewCorrectionProps {
  open: boolean;
  onClose: () => void;
}

const EXERCISES = gql`
  query {
    exercises {
      name
      params {
        name
        defaultValue
        description
      }
    }
  }
`;

export const NewCorrection: React.FC<NewCorrectionProps> = (props) => {
  const { open, onClose } = props;

  const {
    loading,
    error,
    data,
  } = useQuery(EXERCISES);

  const [exerciseSelected, setExerciseSelected] = useState(null);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Crie uma nova correção</DialogTitle>
      <DialogContent>
        <form>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                select
                label={"Nome"}
                fullWidth={true}
                onChange={(event) =>
                  setExerciseSelected(
                    exercises.filter(
                      (exercise) => exercise.name === event.target.value
                    )
                  )
                }
              >
                {exercises &&
                  exercises.map((exercise: any, key) => (
                    <option key={key} value={exercise.name}>
                      {exercise.name}
                    </option>
                  ))}
              </TextField>
              {exerciseSelected && (
                <Card>
                  <CardHeader>{exerciseSelected.name}</CardHeader>
                  <CardContent>
                      {exerciseSelected.params.map(param => (
                          <TextField
                          label={param.name}
                          defaultValue={param.defaultValue}
                          fullWidth={true}
                      />
                      ))}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Concluído
        </Button>
      </DialogActions>
    </Dialog>
  );
};