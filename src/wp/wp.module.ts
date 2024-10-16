import { Module } from '@nestjs/common';
import { WordPressController } from './wp.controller';
import { WordPressService } from './wp.service';


@Module({
  controllers: [WordPressController],
  providers: [WordPressService],
})
export class WordPressModule {}
