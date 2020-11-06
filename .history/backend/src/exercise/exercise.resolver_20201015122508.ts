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
import { spawn, spawnSync } from 'child_process';
import {default as chalk} from 'chalk';
//chalk.lo
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
      exercise.params = this.getParams(join(path, exerciseDir, 'Jenkinsfile'));
      exercises.push(exercise);
    });
    return exercises;
  }

  @Mutation(() => Exercise)
  async create(
    @Args('name') name: string,
    @Args({ name: 'params', type: () => [ParamArg] }) params: ParamArg[],
  ): Promise<Exercise> {
    const path = join(__dirname, '../', '../', 'storage', 'exercises', name);
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
    console.log(simpleParams);
    const paramsArg = Object.keys(simpleParams)
      .reduce((previousValue: any[], currentValue: string) => {
        previousValue.push(`-a "${currentValue}=${simpleParams[currentValue]}"`);
        return previousValue;
      }, [])
      .join(' ');
    //   console.log(this.getParams(join(path, 'Jenkinsfile')));
    // console.log(paramsArg, path.replace(/\s/g, '\\ '), `docker run --rm -v ${path.replace(
    //     /\s/g,
    //     '\\ ',
    //   )}:/workspace -v ${pathPlugins}:/tmp/jenkins_plugins -v /var/run/docker.sock:/var/run/docker.sock argentinaluiz/jenkins-runner -p /tmp/jenkins_plugins ${paramsArg}`);
    spawnSync('rm -rf /tmp/build')
    const cloneName = `Alpine 3 Clone - ${new Date().toISOString().replace(/:/g, "-")}`
    const clonevm = spawnSync(`vboxmanage.exe clonevm "Alpine 3" --name "${cloneName}" --register`)
    if(clonevm.stderr){
      console.log(clonevm.stderr);
      process.exit(1);
    }
    // console.log(clonevm);
    // const showvminfo = spawnSync(`vboxmanage showvminfo "${cloneName}" | grep "NIC 1:" | awk '{print tolower($4)}' | sed 's/.\{2\}/&:/g' | sed 's/.\{2\}$//'`)
    // if(showvminfo.stderr){
    //   console.log(showvminfo.stderr);
    //   process.exit(1);
    // }
    // const macAddress = showvminfo.stdout.toString().replace(/:/g, "-");
    // const ping = spawn(`echo $(seq 254) | xargs -P255 -I% -d" " ping -W 1 -c 1 192.168.1.% | grep -E "[0-1].*?:"`)
    // const ip = spawn(`arp.exe -a | grep ${macAddress}`);
    // ip.stdout.on('data', (msg) => {
    //     const ipAddress = msg.toString().match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0];
    //     const stream = spawn(
    //       `ssh root@${ipAddress} docker run --name jenkins-runner --rm -e JAVA_OPTS="-Dhudson.model.ParametersAction.keepUndefinedParameters=true" -v ${path.replace(
    //         /\s/g,
    //         '\\ ',
    //       )}:/workspace -v ${pathPlugins}:/tmp/jenkins_plugins -v /var/run/docker.sock:/var/run/docker.sock -v /tmp/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins_plugins ${paramsArg} -ns --runWorkspace /tmp/build/test`,
    //       { shell: true },
    //     );
    //     stream.stdout.on('data', function(msg) {
    //       console.log(msg.toString());
    //     });
    
    //     stream.stderr.on('data', function(msg) {
    //       console.log(msg.toString());
    //     });
    // })
    
    return new Exercise();
  }

  getParams(
    jenkinsFilePath: string,
  ): { name: string; defaultValue: string; description: string }[] {
    const jenkinsFile = readFileSync(jenkinsFilePath).toString();
    const matches = jenkinsFile.match(/string\(.*/gm);
    return matches.map(m =>
      JSON.parse(
        m
          .replace(/\'/g, '"')
          .replace(/string\(/g, '{"')
          .replace(/\:/g, '":')
          .replace(/\,\s/g, ',')
          .replace(/\,/g, ',"')
          .replace(')', '}'),
      ),
    );
  }
}
