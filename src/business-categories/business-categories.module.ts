import { Module } from '@nestjs/common';
import { BusinessCategoriesService } from './business-categories.service';
import { BusinessCategoriesController } from './business-categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BusinessCategoriesController],
  providers: [BusinessCategoriesService],
  imports: [PrismaModule],
})
export class BusinessCategoriesModule {}
