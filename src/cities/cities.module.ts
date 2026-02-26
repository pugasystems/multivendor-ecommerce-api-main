import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { StatesService } from 'src/states/states.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CountriesService } from 'src/countries/countries.service';
import { DistrictsService } from 'src/districts/districts.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, DistrictsService, StatesService, CountriesService],
  imports: [PrismaModule],
})
export class CitiesModule {}
