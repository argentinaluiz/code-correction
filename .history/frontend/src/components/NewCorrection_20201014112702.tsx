import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";
import { useState } from "react";
import { useQuery } from "@apollo/client";

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
              <TextField select label={"Nome"} fullWidth={true}>
                {exercises.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
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
