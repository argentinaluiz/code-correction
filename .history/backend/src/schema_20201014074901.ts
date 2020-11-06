import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Exercise{
    name: string
}