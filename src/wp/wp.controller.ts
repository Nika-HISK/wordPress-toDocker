import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WordpressService } from './wp.service';


@Controller('wordpress')
export class WordpressController {
  constructor(private readonly wordpressService: WordpressService) {}

  @Post('setup')
  async setupWordpress(@Body() body: any, @Res() res: Response) {
    try {
      const instanceId = 4
      const message = await this.wordpressService.setupWordpress(body,instanceId);
      return res.status(HttpStatus.OK).json({ message });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'WordPress setup failed.',
        error: error.message,
      });
    }
  }
}
