import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject as JSONObject } from 'graphql-type-json';

@ObjectType()
export class Param {
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

  @Field(of => [Param])
  params: Param[];
}

@ObjectType()
export class Correction {
  @Field()
  name: string;

  @Field(of => JSONObject)
  meta: object;

  @Field()
  created_at: string;

  @Field()
  status: 'running' | 'finished' | 'failed'
}
