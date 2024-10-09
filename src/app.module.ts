import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WpModule } from './wp/wp.module';

@Module({
  imports: [WpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
