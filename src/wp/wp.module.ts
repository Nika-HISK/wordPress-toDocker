import { Module } from '@nestjs/common';
import { WpController } from './wp.controller';
import { WpService } from './wp.service';
import { DockerService } from 'src/docker/docker.service';

@Module({
  controllers: [WpController],
  providers: [WpService,DockerService]
})
export class WpModule {}
