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
      const jenkinsFile = readFileSync(
        join(path, exerciseDir, 'JenkinsFile'),
      ).toString();
      const matches = jenkinsFile.match(/string\(.*/gm);
      exercise.params = matches.map(m => {
        return JSON.parse(
          m
            .replace(/\'/g, '"')
            .replace(/string\(/g, '{"')
            .replace(/\:/g, '":')
            .replace(/\,\s/g, ',')
            .replace(/\,/g, ',"')
            .replace(')', '}'),
        );
      });
      exercises.push(exercise);
    });
    return exercises;
  }
}