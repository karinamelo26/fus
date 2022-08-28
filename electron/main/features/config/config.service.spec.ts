import { access, mkdir } from 'fs/promises';

import { TestBed } from '../../test-bed/test-bed';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useFactory: () => ConfigService.init() }],
    });
    service = TestBed.get(ConfigService);
  });

  it('should create instance', () => {
    expect(service).toBeDefined();
  });

  it('should create in production mode', () => {
    expect(service.homePath).not.toContain('dev');
  });

  it('should create in devMode', async () => {
    global.devMode = true;
    await TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useFactory: () => ConfigService.init() }],
    });
    service = TestBed.get(ConfigService);
    expect(service.homePath).toContain('dev');
  });

  it('should create dev folder', async () => {
    (access as jest.Mock).mockResolvedValueOnce(undefined).mockRejectedValueOnce(undefined);
    global.devMode = true;
    await TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useFactory: () => ConfigService.init() }],
    });
    service = TestBed.get(ConfigService);
    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('dev'));
  });

  it('should create temporary files folder', async () => {
    (access as jest.Mock).mockRejectedValueOnce(undefined);
    await TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useFactory: () => ConfigService.init() }],
    });
    service = TestBed.get(ConfigService);
    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining(service.temporaryFilesPath));
  });
});
