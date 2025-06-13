import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService extends ConsoleLogger {
  private levels: LogLevel[];

  constructor(private readonly configService: ConfigService) {
    super();

    switch (this.configService.get('NODE_ENV')) {
      case 'production':
        this.levels = ['log', 'error', 'warn'];
        break;
      case 'staging':
        this.levels = ['log', 'error', 'warn'];
        break;
      case 'test':
        this.levels = ['log', 'error', 'warn', 'debug', 'verbose'];
        break;
      case 'development':
        this.levels = ['log', 'error', 'warn', 'debug', 'verbose'];
        break;
      default:
        this.levels = ['log', 'error', 'warn', 'debug', 'verbose'];
    }

    this.setLogLevels(this.levels);
  }
}
