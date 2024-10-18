import { Controller, Post } from '@nestjs/common';
import { WordpressService } from './wp.service';


@Controller('wordpress')
export class WordpressController {
  constructor(private readonly wordpressService: WordpressService) {}

  @Post('setup')
  async setupWordpress(): Promise<string> {
    return this.wordpressService.setupWordpress();
  }
}
