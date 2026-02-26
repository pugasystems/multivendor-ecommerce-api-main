import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { AuthenticationsModule } from './authentications/authentications.module';
import { UsersModule } from './users/users.module';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BusinessCategoriesModule } from './business-categories/business-categories.module';
import { CountriesModule } from './countries/countries.module';
import { StatesModule } from './states/states.module';
import { DistrictsModule } from './districts/districts.module';
import { CitiesModule } from './cities/cities.module';
import { ShippingAddressesModule } from './shipping-addresses/shipping-addresses.module';
import { VendorsModule } from './vendors/vendors.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { LeadsModule } from './leads/leads.module';
import { UploadService } from '././upload-service/upload.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    RolesModule,
    AuthenticationsModule,
    UsersModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
      },
    }),
    SubscriptionsModule,
    BusinessCategoriesModule,
    CountriesModule,
    StatesModule,
    DistrictsModule,
    CitiesModule,
    ShippingAddressesModule,
    VendorsModule,
    CategoriesModule,
    ProductsModule,
    LeadsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, UploadService],
})
export class AppModule {}
