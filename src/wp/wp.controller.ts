import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WpService } from './wp.service';
import { CreateWordPressDto } from './wp.interface';

@Controller('wp')
export class WpController {
    constructor(private readonly wpService: WpService) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file')) // Handle file uploads
    async createWordPress(
        @Body() createWordPressDto: CreateWordPressDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.wpService.createWordPress(createWordPressDto, file);
    }
}
