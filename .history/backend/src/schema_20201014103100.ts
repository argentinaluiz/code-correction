import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExerciseParam {
  @Field()
  name: string;

  @Field()
  defaultValue: string;

  @Field()
  description: string;
}

@ObjectType()
export class Exercise {
  @Field()
  name: string;

  @Field(of => [ExerciseParam])
  params?: ExerciseParam[];
}
