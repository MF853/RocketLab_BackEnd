import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation pipe with proper error messages
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RocketLab E-commerce API')
    .setDescription(`
API para gerenciamento de e-commerce com autenticação, produtos e carrinho de compras.

Principais recursos:
- Autenticação com JWT
- Gerenciamento de produtos
- Carrinho de compras
- Controle de estoque
- Diferentes níveis de acesso (Admin/User)
    `)
    .setVersion('1.0')
    .addTag('Auth', 'Autenticação e gerenciamento de usuários')
    .addTag('Produtos', 'Gerenciamento de produtos')
    .addTag('Carrinho', 'Operações do carrinho de compras')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
