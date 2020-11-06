import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Exercise{
    @Field()
    name: string

    @Field()
    jenkinsFile: string
}