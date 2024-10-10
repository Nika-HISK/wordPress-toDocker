import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WpModule } from './wp/wp.module';
import { DockerModule } from './docker/docker.module';

@Module({
  imports: [WpModule, DockerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
