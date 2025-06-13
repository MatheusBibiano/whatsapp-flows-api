import * as crypto from 'crypto';
import { Injectable, MisdirectedException } from '@nestjs/common';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { IEncryptedBodyRequest } from './interfaces/encryptedBodyRequest.interface';

@Injectable()
export class EncryptionService {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('EncryptionService');
  }

  decryptRequest(body: IEncryptedBodyRequest, privatePem: string) {
    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;
    let decryptedAesKey = null;

    try {
      decryptedAesKey = crypto.privateDecrypt(
        {
          key: crypto.createPrivateKey({ key: privatePem }),
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encrypted_aes_key, 'base64'),
      );
    } catch (error) {
      this.logger.error(
        'Failed to decrypt the request. Please verify your private key.',
      );
      throw new MisdirectedException(
        'Failed to decrypt the request. Please verify your private key.',
      );
    }

    const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
    const initialVectorBuffer = Buffer.from(initial_vector, 'base64');
    const TAG_LENGTH = 16;
    const encrypted_flow_data_body = flowDataBuffer.subarray(0, -TAG_LENGTH);
    const encrypted_flow_data_tag = flowDataBuffer.subarray(-TAG_LENGTH);

    const decipher = crypto.createDecipheriv(
      'aes-128-gcm',
      decryptedAesKey,
      initialVectorBuffer,
    );
    decipher.setAuthTag(encrypted_flow_data_tag);

    const decryptedJSONString = Buffer.concat([
      decipher.update(encrypted_flow_data_body),
      decipher.final(),
    ]).toString('utf-8');

    return {
      decryptedBody: JSON.parse(decryptedJSONString),
      aesKeyBuffer: decryptedAesKey,
      initialVectorBuffer,
    };
  }

  encryptResponse(
    response: unknown,
    aesKeyBuffer: Buffer,
    initialVectorBuffer: Buffer,
  ) {
    const flipped_iv = [];
    for (const pair of initialVectorBuffer.entries()) {
      flipped_iv.push(~pair[1]);
    }

    const cipher = crypto.createCipheriv(
      'aes-128-gcm',
      aesKeyBuffer,
      Buffer.from(flipped_iv),
    );

    return Buffer.concat([
      cipher.update(JSON.stringify(response), 'utf-8'),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString('base64');
  }
}
