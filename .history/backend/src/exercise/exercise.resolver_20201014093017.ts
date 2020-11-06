import { Query, Resolver } from '@nestjs/graphql';
import { Exercise } from 'src/schema';
import { readdirSync } from 'fs';
import { join } from 'path';

@Resolver(of => Exercise)
export class ExerciseResolver {
  @Query(returns => [Exercise])
  async exercises(): Promise<Exercise[]> {
    const path = join(__dirname, '../', '../', 'storage', 'exercises');
    const files = readdirSync(path);
    console.log(files);
    return [];
  }
}
