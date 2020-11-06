import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExerciseResolver } from './exercise/exercise.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UserResolver, ExerciseResolver],
})
export class AppModule {}
