import { FlowsService } from './flows.service';
import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { EncryptedBodyRequest } from './dto/encrypted-body-request.dto';
import { CustomLoggerService } from 'src/modules/logger/custom-logger.service';

@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('FlowsController');
  }

  @Post()
  @HttpCode(200)
  async index(@Body() bodyRequest: EncryptedBodyRequest) {
    return await this.flowsService.index(bodyRequest);
  }
}
