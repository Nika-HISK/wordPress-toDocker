import { Test, TestingModule } from '@nestjs/testing';
import { WpController } from './wp.controller';

describe('WpController', () => {
  let controller: WpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WpController],
    }).compile();

    controller = module.get<WpController>(WpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
