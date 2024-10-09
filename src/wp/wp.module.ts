import { Module } from '@nestjs/common';
import { WpController } from './wp.controller';
import { WpService } from './wp.service';

@Module({
  controllers: [WpController],
  providers: [WpService]
})
export class WpModule {}
