import * as React from "react";
import {
  Button,
    Card,
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
  onClose: (formData: { name: string; email: string }) => void;
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
    data: { exercises },
  } = useQuery(EXERCISES);

  const [exerciseSelected, setExerciseSelected] = useState(null);

  const handleClose = () => {
    onClose({ name, email });
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
              {exerciseSelected && <Card>
                  <CardHeader>
                      {exerciseSelected.name}
                  </CardHeader>
              </Card>}
              <TextField
                margin={"normal"}
                label={"E-mail"}
                defaultValue={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth={true}
              />
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

export default ViewerInfoDialog;
