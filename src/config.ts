import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

const settings = dotenv.parse(
  fs.readFileSync(path.join(process.cwd(), '.env')),
);

export class Config {
  static readonly apiBasePath = 'api';

  static getOrmConfig(): DataSourceOptions {
    return {
      type: settings.TYPEORM_CONNECTION as any,
      host: settings.TYPEORM_HOST,
      port: settings.TYPEORM_PORT as any,
      username: settings.TYPEORM_USERNAME,
      password: settings.TYPEORM_PASSWORD,
      database: settings.TYPEORM_DATABASE,
      synchronize: settings.TYPEORM_SYNCHRONIZE === 'false',
      bigNumberStrings: false,
      entities: [settings.TYPEORM_ENTITIES],
      migrations: [settings.TYPEORM_MIGRATIONS],
    };
  }
}