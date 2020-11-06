import { Query, Resolver } from '@nestjs/graphql';
import { Exercise } from 'src/schema';
import fs from 'fs';
import { join } from 'path';
//const files = fs.readFileSync(join(__dirname, '../../', 'storage', 'exercises'));
    //console.log(files);
@Resolver(of => Exercise)
export class ExerciseResolver {
  @Query(returns => [Exercise])
  async exercises(): Promise<Exercise[]> {
    
    return [];
  }
}