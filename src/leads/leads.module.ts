import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { ProductsService } from 'src/products/products.service';
import { VendorsService } from 'src/vendors/vendors.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ShippingAddressesService } from 'src/shipping-addresses/shipping-addresses.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';
import { CountriesService } from 'src/countries/countries.service';
import { StatesService } from 'src/states/states.service';
import { DistrictsService } from 'src/districts/districts.service';
import { CitiesService } from 'src/cities/cities.service';
import { UploadService } from 'src/upload-service/upload.service';

@Module({
  controllers: [LeadsController],
  providers: [
    LeadsService,
    UsersService,
    RolesService,
    ProductsService,
    VendorsService,
    CategoriesService,
    ShippingAddressesService,
    SubscriptionsService,
    BusinessCategoriesService,
    CountriesService,
    StatesService,
    DistrictsService,
    CitiesService,
    UploadService,
  ],
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "users",
    }),
  ],
})
export class LeadsModule {}
