import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/users/users.service';
import { BullModule } from '@nestjs/bull';
import { RolesService } from 'src/roles/roles.service';
import { ShippingAddressesService } from 'src/shipping-addresses/shipping-addresses.service';
import { CountriesService } from 'src/countries/countries.service';
import { StatesService } from 'src/states/states.service';
import { DistrictsService } from 'src/districts/districts.service';
import { CitiesService } from 'src/cities/cities.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';

@Module({
  controllers: [VendorsController],
  providers: [
    VendorsService,
    UsersService,
    RolesService,
    ShippingAddressesService,
    CountriesService,
    StatesService,
    DistrictsService,
    CitiesService,
    SubscriptionsService,
    BusinessCategoriesService,
  ],
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "users",
    }),
  ],
})
export class VendorsModule {}
