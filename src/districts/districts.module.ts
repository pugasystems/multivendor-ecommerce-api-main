import { Module } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { StatesService } from 'src/states/states.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CountriesService } from 'src/countries/countries.service';

@Module({
  controllers: [DistrictsController],
  providers: [DistrictsService, StatesService, CountriesService],
  imports: [PrismaModule],
})
export class DistrictsModule {}
