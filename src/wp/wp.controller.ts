import { Controller, Post, Body } from '@nestjs/common';
import { WordPressService } from './wp.service';
import { CreateWordPressDto } from './wp.interface';

@Controller('wordpress')
export class WordPressController {
  constructor(private readonly wordpressService: WordPressService) {}

  @Post('setup')
  async setupWordPress(@Body() createWordPressDto: CreateWordPressDto) {
    return await this.wordpressService.setupWordPress(createWordPressDto);
  }
}
