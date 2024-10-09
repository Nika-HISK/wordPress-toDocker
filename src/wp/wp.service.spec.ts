import { Test, TestingModule } from '@nestjs/testing';
import { WpService } from './wp.service';

describe('WpService', () => {
  let service: WpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WpService],
    }).compile();

    service = module.get<WpService>(WpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
