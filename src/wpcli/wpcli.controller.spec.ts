import { Test, TestingModule } from '@nestjs/testing';
import { WpcliController } from './wpcli.controller';

describe('WpcliController', () => {
  let controller: WpcliController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WpcliController],
    }).compile();

    controller = module.get<WpcliController>(WpcliController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
