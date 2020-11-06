import { Resolver } from '@nestjs/graphql';
import { Exercise } from 'src/schema';

@Resolver(of => Exercise)
export class ExerciseResolver {}
