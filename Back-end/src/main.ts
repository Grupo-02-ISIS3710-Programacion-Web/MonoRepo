import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'https://front-end-skin4all.vercel.app',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Skin4All API - Documentación')
    .setDescription(
      'API para la gestión de rutinas de cuidado de la piel. Esta API permite crear, consultar, actualizar y eliminar rutinas, así como gestionar votos y visualizaciones. Los datos se cargan mediante el endpoint /seed utilizando mocks de usuarios, productos y rutinas.',
    )
    .setVersion('1.0')
    .addTag(
      'Rutinas',
      'Endpoints para la gestión de rutinas de cuidado de la piel',
    )
    .addTag('Productos', 'Endpoints para la gestión de productos de cosmética')
    .addTag('Seed', 'Endpoint para cargar datos de prueba (mocks)')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Documentación Skin4All API',
    customCss: '.swagger-ui .topbar { background-color: #4caf50; }',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
