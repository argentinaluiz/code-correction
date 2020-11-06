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
import { default as chalk } from 'chalk';
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
        previousValue.push(
          `-a ${currentValue}=${simpleParams[currentValue]}`,
        );
        return previousValue;
      }, [])
      .join(' ');
    //   console.log(this.getParams(join(path, 'Jenkinsfile')));
    // console.log(paramsArg, path.replace(/\s/g, '\\ '), `docker run --rm -v ${path.replace(
    //     /\s/g,
    //     '\\ ',
    //   )}:/workspace -v ${pathPlugins}:/tmp/jenkins_plugins -v /var/run/docker.sock:/var/run/docker.sock argentinaluiz/jenkins-runner -p /tmp/jenkins_plugins ${paramsArg}`);
    spawnSync('rm -rf /tmp/build');
    const cloneName = `Alpine 3 Clone - ${new Date()
      .toISOString()
      .replace(/:/g, '-')}`;
    const clonevm = spawnSync(
      `vboxmanage.exe clonevm "Alpine 3" --name "${cloneName}" --register`,
      //`vboxmanage.exe clonevm "Alpine 3" --name "${cloneName}" --snapshot "Alpine 3 Snapshot" --register --options=Link`,
      { shell: true },
    );
    if (clonevm.error) {
      console.log(clonevm.error);
      process.exit(1);
    }
    console.log('Cloning vm', clonevm.stdout.toString(), clonevm.output.toString());
    const showvminfo = spawnSync(
      `vboxmanage.exe showvminfo "${cloneName}" | grep MAC | awk '{print $4}' | cut -d',' -f1`,
      { shell: true },
    );
    if (showvminfo.error) {
      console.log(showvminfo.error);
      process.exit(1);
    }
    console.log(showvminfo.output.toString());
    const macAddress = showvminfo.stdout
      .toString()
      .match(/.{1,2}/g)
      .join('-')
      .toLowerCase();
    console.log('MAC Address', macAddress);
    const startvm = spawnSync(
      `vboxmanage.exe startvm "${cloneName}" --type headless`,
      { shell: true },
    );
    if (startvm.error) {
      console.log(startvm.error);
      process.exit(1);
    }
    console.log(startvm.output.toString());
    const waitTill = new Date(new Date().getTime() + 60 * 1000);
    while (waitTill > new Date()) {}
    const ping = spawn(
      `echo $(seq 254) | xargs -P255 -I% -d" " ping -W 1 -c 1 192.168.1.% | grep -E "[0-1].*?:"`,
      { shell: true },
    );
    ping.stdout.on('data', msg => console.log(msg.toString()));
    ping.stderr.on('data', msg => console.log(msg.toString()));
    let count = 0;
    let matchIpAddress = [];
    let ip;
    do {
      ip = spawnSync(`arp.exe -a | grep -a "${macAddress}"`, { shell: true });
      console.log(ip.stdout.toString(), ip.stderr.toString(), ip);
      matchIpAddress = ip.stdout
        .toString()
        .match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
      if (matchIpAddress && macAddress.length) {
        break;
      }
      count++;
      const waitTill = new Date(new Date().getTime() + 1 * 1000);
      while (waitTill > new Date()) {}
    } while ((!matchIpAddress || !matchIpAddress.length) && count < 50);
    if (!matchIpAddress || !matchIpAddress.length) {
      console.error('MAC Address not found');

      process.exit(1);

    }

    const ipAddress = ip.stdout
      .toString()
      .match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0];
    console.log(`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} docker run --name jenkins-runner --rm -e JAVA_OPTS="-Dhudson.model.ParametersAction.keepUndefinedParameters=true" -v /tmp/workspace:/workspace -v /tmp/jenkins/plugins:/tmp/jenkins/plugins -v /var/run/docker.sock:/var/run/docker.sock -v /tmp/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins/plugins ${paramsArg} -ns --runWorkspace /tmp/build/test`);
    const copyWorkspace = spawnSync(`scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -r ${path.replace(/\s/g,'\\ ')}/* root@${ipAddress}:/root/workspace`, {shell: true});
    console.log(`scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -r ${path.replace(/\s/g,'\\ ')}/* root@${ipAddress}:/tmp/workspace`);
    if (copyWorkspace.error) {
      console.log(copyWorkspace.error);
      process.exit(1);
    }
    console.log(copyWorkspace.output.toString());
    // const dockerRestart = spawnSync(`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} docker rm $(docker ps -a -q)`, {shell: true});
    // if (dockerRestart.error) {
    //   console.log(dockerRestart.error);
    //   process.exit(1);
    // }
    // console.log(dockerRestart.output.toString());
    // const waitTill1 = new Date(new Date().getTime() + 10 * 1000);
    //   while (waitTill1 > new Date()) {}
    const stream = spawn(
      `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} service docker restart && docker run --rm -e JAVA_OPTS=-Dhudson.model.ParametersAction.keepUndefinedParameters=true -v /root/workspace/Jenkinsfile:/workspace -v /root/jenkins/plugins:/tmp/jenkins/plugins -v /var/run/docker.sock:/var/run/docker.sock -v /root/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins/plugins ${paramsArg} -ns --runWorkspace /tmp/build/test`,
      { shell: true  },
    );

    stream.stdout.on('data', function(msg) {
      console.log(msg.toString());
    });
    stream.stderr.on('data', function(msg) {
      console.log(msg.toString());
    });

    stream.on('exit', () => {
      // spawnSync(`vboxmanage.exe controlvm "${cloneName}" poweroff soft`, {
      //   shell: true,
      // });

      // spawnSync(`vboxmanage.exe unregistervm --delete "${cloneName}"`, {shell: true});
    });

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
