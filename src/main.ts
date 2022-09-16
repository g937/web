import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import packageJson from '../package.json';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle(packageJson.title)
        .setDescription(packageJson.description)
        .setVersion(packageJson.version)
        .build();

    const configService = app.get(ConfigService);

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get('DOCUMENTATION_URL') || 'api', app, document);

    await app.listen(configService.get('PORT') || 3000);
}
bootstrap();