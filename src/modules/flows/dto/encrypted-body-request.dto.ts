import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptedBodyRequest {
  @IsNotEmpty()
  @IsString()
  encrypted_aes_key: string;

  @IsNotEmpty()
  @IsString()
  encrypted_flow_data: string;

  @IsNotEmpty()
  @IsString()
  initial_vector: string;
}
