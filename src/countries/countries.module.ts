import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
  imports: [PrismaModule],
})
export class CountriesModule {}
