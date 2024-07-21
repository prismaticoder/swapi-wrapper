import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { JsonResponse } from './common/helpers/json-response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): JsonResponse {
    return JsonResponse.create('May the Force be with you.'); // :)
  }
}
