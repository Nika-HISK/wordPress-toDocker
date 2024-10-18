import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerModule } from './docker/docker.module';
import { WordpressModule } from './wp/wp.module';

@Module({
  imports: [WordpressModule, DockerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
