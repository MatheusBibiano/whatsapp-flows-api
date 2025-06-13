import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../logger/custom-logger.service';
import {
  IScreenDataRequest,
  IScreenDataResponse,
} from './interfaces/screen-data.interface';

@Injectable()
export class ScreensRouter {
  private screenData: IScreenDataResponse;

  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('ScreensRouterProvider');
  }

  public async index(screenData: IScreenDataRequest) {
    this.logger.log(`Looking for a case for ${screenData.screen}`);
    switch (screenData.screen) {
      case 'SCREEN_A':
        this.screenData = await this.screenA(screenData);
        break;
      default:
        const screenErrorMessage = `Value '${screenData.screen}' is not a valid screen name`;
        this.logger.error(screenErrorMessage);
        throw new BadRequestException(screenErrorMessage);
    }

    this.logger.log('Responding with next screen data');
    this.logger.verbose(JSON.stringify(this.screenData, null, 2));
    return this.screenData;
  }

  private async screenA(screenData: IScreenDataRequest) {
    // ** Do something **
    return {
      version: screenData.version,
      screen: 'SCREEN_B',
      data: {},
    };
  }
}
