import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';
import { UploadService } from 'src/upload-service/upload.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, BusinessCategoriesService, UploadService],
  imports: [PrismaModule],
})
export class CategoriesModule {}
