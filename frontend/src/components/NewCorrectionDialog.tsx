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
  MenuItem,
  TextField,
} from "@material-ui/core";
import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";

export interface NewCorrectionProps {
  open: boolean;
  onClose: (result?: any) => void;
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

const CREATE = gql`
  mutation Create($name: String!, $params: JSONObject!) {
    create(name: $name, params: $params) {
      name
      meta
      created_at
      status
    }
  }
`;

export const NewCorrectionDialog: React.FC<NewCorrectionProps> = (props) => {
  const { open, onClose } = props;
  const { register, handleSubmit, setValue, watch, errors } = useForm({
    defaultValues: {
      name: "",
    },
  });
  const [addTodo, { data: teste }] = useMutation(CREATE, {});
  const { loading, error, data = { exercises: [] } } = useQuery(EXERCISES);
  console.log(teste);
  const exercises: any = data.exercises;

  const [exerciseSelected, setExerciseSelected] = useState<{
    name: string;
    params: { name: string; defaultValue: string }[];
  } | null>(null);

  React.useEffect(() => {
    register({ name: "name" });
  }, []);

  const handleClose = (result?:any) => {
    onClose(result);
  };

  async function onSubmit(data: any) {
    const result = await addTodo({
      variables: {
        ...data,
      },
    });
    handleClose(result.data.create);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Crie uma nova correção</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                select
                label={"Nome"}
                fullWidth={true}
                value={watch("name")}
                onChange={(event) => {
                  const exercise = exercises.find(
                    (exercise: { name: string }) =>
                      exercise.name === event.target.value
                  );
                  setValue("name", exercise.name);
                  setExerciseSelected(exercise);
                }}
              >
                {exercises.map((exercise: any, key: number) => {
                  console.log(key + "");
                  return (
                    <MenuItem key={exercise.name} value={exercise.name}>
                      {exercise.name}
                    </MenuItem>
                  );
                })}
              </TextField>
              {exerciseSelected && (
                <Card>
                  <CardHeader title={exerciseSelected.name} />
                  <CardContent>
                    {exerciseSelected.params.map((param, key) => (
                      <TextField
                        margin={"normal"}
                        name={`params[${param.name}]`}
                        label={param.name}
                        defaultValue={param.defaultValue}
                        fullWidth={true}
                        inputRef={register}
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
        <Button color="primary" onClick={() => handleSubmit(onSubmit)()}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
