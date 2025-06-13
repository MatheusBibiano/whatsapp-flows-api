import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScreensRouter } from './screens-router.provider';
import { EncryptionService } from '../encryption/encryption.service';
import { EncryptedBodyRequest } from './dto/encrypted-body-request.dto';
import { CustomLoggerService } from 'src/modules/logger/custom-logger.service';

@Injectable()
export class FlowsService {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly screenRouter: ScreensRouter,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {
    this.logger.setContext('FlowsService');
  }

  async index(bodyRequest: EncryptedBodyRequest) {
    this.logger.log('Recreceiving the request from Meta');
    this.logger.verbose(
      `Encrypted body request:\n${JSON.stringify(bodyRequest, null, 2)}`,
    );

    const { decryptedBody, aesKeyBuffer, initialVectorBuffer } =
      this.encryptionService.decryptRequest(
        bodyRequest,
        this.configService.get('PRIVATE_KEY'),
      );

    this.logger.log('Body request successfully decrypted');
    this.logger.verbose(
      `Decrypted body request:\n${JSON.stringify(decryptedBody, null, 2)}`,
    );

    const isPingRequest = decryptedBody?.action === 'ping';

    if (isPingRequest) {
      this.logger.log("Responding to Meta's ping request");
      return this.handleHealthCheck(aesKeyBuffer, initialVectorBuffer);
    }

    const nextScreenData = this.screenRouter.index(decryptedBody);

    this.logger.log("Responding to Meta's with encrypted screen data response");
    return this.encryptionService.encryptResponse(
      nextScreenData,
      aesKeyBuffer,
      initialVectorBuffer,
    );
  }

  private handleHealthCheck(aesKeyBuffer: Buffer, initialVectorBuffer: Buffer) {
    const pingResponse = {
      version: this.configService.get('DATA_API_VERSION'),
      data: {
        status: 'active',
      },
    };

    return this.encryptionService.encryptResponse(
      pingResponse,
      aesKeyBuffer,
      initialVectorBuffer,
    );
  }
}
