import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerModule } from './docker/docker.module';
import { WordpressModule } from './wp/wp.module';
import { WpCliModule } from './wpcli/wpcli.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    WordpressModule,
    DockerModule,
    WpCliModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
