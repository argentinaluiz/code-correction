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
import { Correction, Exercise } from 'src/schema';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawn, spawnSync } from 'child_process';
import { default as chalk } from 'chalk';
import { Client } from 'ssh2';
import { writeFileSync, appendFileSync, createReadStream } from 'fs';
import { GraphQLJSONObject as JSONObject } from 'graphql-type-json';
import { WebsocketService } from 'src/websocket/websocket.service';
//chalk.lo
@InputType()
class ParamArg {
  @Field()
  name: string;
  @Field()
  value: string;
}
@ObjectType()
class CreateMutation {
  @Field()
  name: string;
}

@ObjectType()
class Param1Arg {
  @Field()
  content: string;
}

@Resolver(of => Exercise)
export class ExerciseResolver {
  constructor(private websocket: WebsocketService) {}

  @Query(returns => [Correction])
  async corrections(): Promise<Correction[]> {
    const path = join(__dirname, '../', '../', 'storage', 'corrections');
    const correctionsDir = readdirSync(path).reverse();
    const corrections = correctionsDir.map(async correctionFile => {
      const correction = new Correction();
      const [createdAt, name] = correctionFile.split('_');
      correction.name = name.split('.')[0];
      correction.created_at = createdAt;
      const meta = await this.readFirstLine(join(path, correctionFile));
      correction.meta = JSON.parse(meta);
      correction.status = await this.getStatus(join(path, correctionFile));
      return correction;
    });
    return await Promise.all(corrections);
  }

  @Query(returns => Param1Arg)
  async getCorrection(@Args('date') date: string): Promise<Param1Arg> {
    const path = join(__dirname, '../', '../', 'storage', 'corrections');
    const correctionsDir = readdirSync(path);
    const correctionFile = correctionsDir.find(correctionFile => {
      if (correctionFile.indexOf(date) >= 0) {
        return true;
      }
      return false;
    });
    const content = readFileSync(join(path, correctionFile)).toString();
    return { content };
  }

  async readFirstLine(path): Promise<string> {
    return new Promise((resolve, reject) => {
      var rs = createReadStream(path, { encoding: 'utf8' });
      var acc = '';
      var pos = 0;
      var index;
      rs.on('data', chunk => {
        index = chunk.indexOf('\n');
        acc += chunk;
        index !== -1 ? rs.close() : (pos += chunk.length);
      })
        .on('close', () => resolve(acc.slice(0, pos + index)))
        .on('error', err => reject(err));
    });
  }

  async getStatus(path) {
    const data = readFileSync(path);
    return data.indexOf('FINISHED') ? 'finished' : 'running';
  }

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

  @Mutation(() => Correction)
  async create(
    @Args('name') name: string,
    @Args({ name: 'params', type: () => JSONObject }) params: object,
  ): Promise<Correction> {
    const path = join(__dirname, '../', '../', 'storage', 'exercises', name);
    const paramsArg = Object.keys(params)
      .reduce((previousValue: any[], currentValue: string) => {
        previousValue.push(`-a "${currentValue}=${params[currentValue]}"`);
        return previousValue;
      }, [])
      .join(' ');
    
    const createdAt = new Date().toISOString().replace(/:/g, '-');
    const cloneName = `Alpine 3 Clone - ${createdAt}`;
    const clonevm = spawn(
      `vboxmanage clonevm "Alpine 3" --name "${cloneName}" --snapshot "Alpine 3 Snapshot" --register --options=Link`,
      { shell: true },
    );
    const fileName = `${createdAt}_${name}.txt`;
    const pathCorrection = join(
      __dirname,
      '../',
      '../',
      'storage',
      'corrections',
      fileName,
    );
    writeFileSync(pathCorrection, JSON.stringify(params) + '\n');
    clonevm.stdout.on('data', msg => {
      console.log(msg.toString());
      const pathCorrection = join(
        __dirname,
        '../',
        '../',
        'storage',
        'corrections',
        fileName,
      );
      appendFileSync(pathCorrection, msg.toString());
      const showvminfo = spawnSync(
        `vboxmanage showvminfo "${cloneName}" | grep MAC | awk '{print $4}' | cut -d',' -f1`,
        { shell: true },
      );
      if (showvminfo.error) {
        console.log(showvminfo.error);
        process.exit(1);
      }
      const macAddress = showvminfo.stdout
        .toString()
        .match(/.{1,2}/g)
        .join(':') // -
        .toLowerCase();
      const startvm = spawnSync(
        `vboxmanage startvm "${cloneName}" --type headless`,
        { shell: true },
      );
      if (startvm.error) {
        console.log(startvm.error);
        process.exit(1);
      }
      const getIP = spawnSync(
        `hostname -I`,
        { shell: true },
      );
      if (getIP.error) {
        console.log(getIP.error);
        process.exit(1);
      }
      const myIp = getIP.stdout.toString().split(' ')[0].split('.').slice(0,3).join('.')+".%";
      const waitTill = new Date(new Date().getTime() + 60 * 1000);
      while (waitTill > new Date()) {}
      const ping = spawn(
        `echo $(seq 254) | xargs -P255 -I% -d" " ping -W 1 -c 1 ${myIp} | grep -E "[0-1].*?:"`,
        { shell: true },
      );
      ping.stdout.on('data', msg => console.log(msg.toString()));
      ping.stderr.on('data', msg => console.log(msg.toString()));
      let count = 0;
      let matchIpAddress = [];
      let ip;
      do {
        ip = spawnSync(`cat /proc/net/arp | grep -a "${macAddress}"`, {
          shell: true,
        });
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
        return;
      }

      const ipAddress = ip.stdout
        .toString()
        .match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)[0];
      const copyWorkspace = spawnSync(
        `scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -r ${path.replace(
          /\s/g,
          '\\ ',
        )}/* root@${ipAddress}:/root/workspace`,
        { shell: true },
      );
      // console.log(
      //   `scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -r ${path.replace(
      //     /\s/g,
      //     '\\ ',
      //   )}/* root@${ipAddress}:/tmp/workspace`,
      // );
      if (copyWorkspace.error) {
        console.error(copyWorkspace.error);
        process.exit(1);
      }
      // console.log(copyWorkspace.output.toString());
      // const dockerRestart = spawnSync(`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} docker rm $(docker ps -a -q)`, {shell: true});
      // if (dockerRestart.error) {
      //   console.log(dockerRestart.error);
      //   process.exit(1);
      // }
      // console.log(dockerRestart.output.toString());
      // const waitTill1 = new Date(new Date().getTime() + 10 * 1000);
      //   while (waitTill1 > new Date()) {}
      const stream = spawn(
        `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} "docker run --rm --name jenkins-runner -e JAVA_OPTS=-Dhudson.model.ParametersAction.keepUndefinedParameters=true -v /root/workspace:/workspace -v /root/jenkins/plugins:/tmp/jenkins/plugins -v /var/run/docker.sock:/var/run/docker.sock -v /root/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins/plugins ${paramsArg} -ns --runWorkspace /tmp/build/test"`,
        //`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ipAddress} service docker restart && docker run --rm -e JAVA_OPTS=-Dhudson.model.ParametersAction.keepUndefinedParameters=true -v /root/workspace/Jenkinsfile:/workspace/Jenkinsfile -v /root/jenkins/plugins:/tmp/jenkins/plugins -v /var/run/docker.sock:/var/run/docker.sock -v /root/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins/plugins ${paramsArg} -ns --runWorkspace /tmp/build/test`,
        { shell: true },
      );

      stream.stdout.on('data', function(msg) {
        //console.log(msg.toString());
        appendFileSync(pathCorrection, msg.toString());
      });
      stream.stderr.on('data', function(msg) {
        console.error(msg.toString());
      });

      stream.on('exit', () => {
        spawnSync(`vboxmanage controlvm "${cloneName}" poweroff soft`, {
          shell: true,
        });

        spawnSync(`vboxmanage unregistervm --delete "${cloneName}"`, {
          shell: true,
        });
        this.websocket.server.emit('correction.finished', createdAt);
      });

      // const conn = new Client();
      // conn
      //   .on('ready', function() {
      //     console.log('Client :: ready');
      //     conn.shell(function(err, stream) {
      //       if (err) throw err;
      //       stream
      //         .on('close', function() {
      //           console.log('Stream :: close');
      //           conn.end();
      //         })
      //         .on('data', function(data) {
      //           console.log('OUTPUT: ' + data);
      //         });
      //       //  stream.write('apk del docker -f\n');
      //       //  stream.write('apk add docker -f\n')
      //       //  stream.write('addgroup root docker\n');
      //       //  stream.write('rc-update add docker boot\n');
      //       //  stream.write('service docker start\n');
      //       //stream.write('service docker stop\n');
      //       //stream.write('rm /var/run/docker.sock\n')
      //       //stream.write('service docker start\n');
      //       stream.write(`docker run --rm --name jenkins-runner -e JAVA_OPTS=-Dhudson.model.ParametersAction.keepUndefinedParameters=true -v /root/workspace:/workspace -v /root/jenkins/plugins:/tmp/jenkins/plugins -v /var/run/docker.sock:/var/run/docker.sock -v /root/build:/tmp/build argentinaluiz/jenkins-runner -p /tmp/jenkins/plugins ${paramsArg} -ns --runWorkspace /tmp/build/test\n`);
      //       stream.end('exit')
      //       //stream.end('ls -l\nexit\n');
      //     });
      //   })
      //   .connect({
      //     host: ipAddress,
      //     port: 22,
      //     username: 'root',
      //   });
      // return;

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
    });
    clonevm.stderr.on('data', function(msg) {
      console.error(msg.toString());
    });

    return {
      name: fileName.split('_')[1].split('.')[0],
      meta: params,
      status: 'running',
      created_at: createdAt,
    };
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
