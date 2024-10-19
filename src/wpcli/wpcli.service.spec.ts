import { Test, TestingModule } from '@nestjs/testing';
import { WpcliService } from './wpcli.service';

describe('WpcliService', () => {
  let service: WpcliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WpcliService],
    }).compile();

    service = module.get<WpcliService>(WpcliService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
