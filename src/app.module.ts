import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerModule } from './docker/docker.module';
import { WordpressModule } from './wp/wp.module';
import { WpCliModule } from './wpcli/wpcli.module';

@Module({
  imports: [WordpressModule, DockerModule, WpCliModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
