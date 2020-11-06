import {
  Args,
  ArgsType,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Exercise } from 'src/schema';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

@InputType()
class ParamArg {
  @Field()
  name: string;
  @Field()
  value: string;
}

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
        join(path, exerciseDir, 'Jenkinsfile'),
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

  @Mutation(() => Exercise)
  async create(
    @Args('name') name: string,
    @Args({ name: 'params', type: () => [ParamArg] }) params: ParamArg[],
  ): Promise<Exercise> {
    const path = join(
      __dirname,
      '../',
      '../',
      'storage',
      'exercises',
      name,
    );
    const pathPlugins = join(
        __dirname,
      '../',
      '../',
      'storage',
      'jenkins',
      'plugins',
    );
    const simpleParams = Object.keys(params).reduce(
      (previousValue: any, currentValue: string) => {
        previousValue[params[currentValue].name] = params[currentValue].value;
        return previousValue;
      },
      {},
    );
    console.log(simpleParams)
    const paramsArg = Object.keys(simpleParams)
      .reduce((previousValue: any[], currentValue: string) => {
        previousValue.push(`-a ${currentValue}=${simpleParams[currentValue]}`);
        return previousValue;
      }, [])
      .join(' ');
    console.log(paramsArg, path.replace(/\s/g, "\\ "));
    const stream = spawn(
      `docker run --rm -e JAVA_OPTS="-Dhudson.model.ParametersAction.safeParameters=${Object.keys(simpleParams).join(',')}" -v ${path.replace(/\s/g, "\\ ")}:/workspace -v ${pathPlugins}:/tmp/jenkins_plugins  jenkins/jenkinsfile-runner -p /tmp/jenkins_plugins ${paramsArg}`,
    {shell: true});
    stream.stdout.on('data', function(msg) {
      console.log(msg.toString());
    });
    stream.stderr.on('data', function(msg) {
        console.log(msg.toString());
      });
    return new Exercise();
  }
}