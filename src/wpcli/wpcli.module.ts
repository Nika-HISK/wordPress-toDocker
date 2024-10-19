import { Module } from '@nestjs/common';
import { WpCliController } from './wpcli.controller';
import { WpCliService } from './wpcli.service';


@Module({
  controllers: [WpCliController],
  providers: [WpCliService],
})
export class WpCliModule {}