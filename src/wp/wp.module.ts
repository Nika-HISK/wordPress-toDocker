import { Module } from '@nestjs/common';
import { WordpressController } from './wp.controller';
import { WordpressService } from './wp.service';


@Module({
  controllers: [WordpressController],
  providers: [WordpressService],
})
export class WordpressModule {}
