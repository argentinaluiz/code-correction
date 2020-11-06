import { Query, Resolver } from '@nestjs/graphql';
import { Exercise } from 'src/schema';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

@Resolver(of => Exercise)
export class ExerciseResolver {
  @Query(returns => [Exercise])
  async exercises(): Promise<Exercise[]> {
    const exercises = [];
    const path = join(__dirname, '../', '../', 'storage', 'exercises');
    const exercisesDir = readdirSync(path);
    exercisesDir.forEach(exerciseDir => {
      const exercise = new Exercise();
      exercise.name = exerciseDir;
      exercise.jenkinsFile = readFileSync(join(path,exerciseDir, 'JenkinsFile')).toString();
      const matches = exercise.jenkinsFile.match(/string\(.*/gm);
      const params = matches.map(m => {
          return m
          .replace(/\'/, '"')
          .replace(/string\(/, '{"')
          .replace(/\:/, '":')
          .replace(/\,\s/, ',')
          .replace(/\,/, ',"')
      })
      console.log(params)
      exercises.push(exercise);
    });
    return exercises;
  }
}
