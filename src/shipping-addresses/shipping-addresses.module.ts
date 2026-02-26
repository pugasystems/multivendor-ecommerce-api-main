import { Module } from '@nestjs/common';
import { ShippingAddressesService } from './shipping-addresses.service';
import { ShippingAddressesController } from './shipping-addresses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CountriesService } from 'src/countries/countries.service';
import { StatesService } from 'src/states/states.service';
import { DistrictsService } from 'src/districts/districts.service';
import { CitiesService } from 'src/cities/cities.service';
import { UsersService } from 'src/users/users.service';
import { BullModule } from '@nestjs/bull';
import { RolesService } from 'src/roles/roles.service';

@Module({
  controllers: [ShippingAddressesController],
  providers: [
    ShippingAddressesService,
    CountriesService,
    StatesService,
    DistrictsService,
    CitiesService,
    UsersService,
    RolesService,
  ],
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "users",
    }),
  ],
})
export class ShippingAddressesModule {}
