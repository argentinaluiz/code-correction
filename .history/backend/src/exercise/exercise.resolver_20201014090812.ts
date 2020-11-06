import { Query, Resolver } from '@nestjs/graphql';
import { Exercise } from 'src/schema';

@Resolver(of => Exercise)
export class ExerciseResolver {
  @Query(returns => [Exercise])
  async exercises(): Promise<Exercise[]> {
    return [];
  }
}
