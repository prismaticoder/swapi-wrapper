import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsonResponse } from './common/helpers/json-response';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome response', () => {
      const welcomeResponse = JsonResponse.create('May the Force be with you.');

      expect(appController.index()).toEqual(welcomeResponse);
    });
  });
});
