import { Module } from '@nestjs/common';
import { StatesService } from './states.service';
import { StatesController } from './states.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CountriesService } from 'src/countries/countries.service';

@Module({
  controllers: [StatesController],
  providers: [StatesService, CountriesService],
  imports: [PrismaModule]
})
export class StatesModule {}
