import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesService } from 'src/categories/categories.service';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';
import { VendorsService } from 'src/vendors/vendors.service';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { ShippingAddressesService } from 'src/shipping-addresses/shipping-addresses.service';
import { CountriesService } from 'src/countries/countries.service';
import { StatesService } from 'src/states/states.service';
import { DistrictsService } from 'src/districts/districts.service';
import { CitiesService } from 'src/cities/cities.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { BullModule } from '@nestjs/bull';
import { UploadService } from 'src/upload-service/upload.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    CategoriesService,
    BusinessCategoriesService,
    VendorsService,
    UsersService,
    RolesService,
    ShippingAddressesService,
    CountriesService,
    StatesService,
    DistrictsService,
    CitiesService,
    SubscriptionsService,
    UploadService,
  ],
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "users",
    }),
  ],
})
export class ProductsModule {}
