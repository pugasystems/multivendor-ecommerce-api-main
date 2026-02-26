import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';
import { CategoryEntity } from './entities/category.entity';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { CategoryQuery } from 'src/interfaces/query.interface';
import { Categories } from './entities/categories.entity';
import { UploadService } from 'src/upload-service/upload.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessCategoryService: BusinessCategoriesService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    await this.businessCategoryService.findOne(+createCategoryDto.businessCategoryId);

    if (createCategoryDto.parentCategoryId) {
      const parentCategory = await this.findOne(+createCategoryDto.parentCategoryId);
      createCategoryDto.parentCategoryId = parentCategory.id;
    }

    createCategoryDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createCategoryDto.name);

    const isCategoryTaken = await this.checkIfCategoryIsAlreadyTaken(createCategoryDto.name);

    if (isCategoryTaken) {
      throw new NotAcceptableException(`Category ${createCategoryDto.name} is already taken.`);
    }

    if (createCategoryDto.image) {
      createCategoryDto.imageUrl = await this.uploadService.uploadImage(
        createCategoryDto.image,
        createCategoryDto.name,
        'categories',
      );
    }

    return this.prisma.category.create({
      data: {
        ...(createCategoryDto.parentCategoryId && { parentCategoryId: createCategoryDto.parentCategoryId }),
        name: createCategoryDto.name,
        businessCategoryId: createCategoryDto.businessCategoryId,
        ...(createCategoryDto.imageUrl && { imageUrl: createCategoryDto.imageUrl }),
        vendors: {
          create: [
            {
              vendor: {
                connect: {
                  id: +createCategoryDto.vendorId,
                }
              }
            }
          ],
        }
      },
    });
  }

  async findAll(query: CategoryQuery): Promise<Categories> {
    const { businessCategoryId, parentCategoryId, search } = query;

    const whereClause: { AND?: object[] } = {
      AND: [
        ...(businessCategoryId ? [{ businessCategoryId }] : []),
        ...(parentCategoryId ? [{ parentCategoryId }] : []),
        ...(search ? [
          {
            OR: [
              { name: { contains: search } },
              { businessCategory: { name: { contains: search } } },
            ],
          },
        ] : []),
      ],
    };

    const [totalCount, categories] = await this.prisma.$transaction([
      this.prisma.category.count({ where: whereClause }),
      this.prisma.category.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, categories };
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.prisma.category.findFirst({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Unable to find the category with id ${id}`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    if (updateCategoryDto.businessCategoryId) {
      const businessCategory = await this.businessCategoryService.findOne(updateCategoryDto.businessCategoryId);
      updateCategoryDto.businessCategoryId = businessCategory.id;
    }

    if (updateCategoryDto.parentCategoryId) {
      const parentCategory = await this.findOne(+updateCategoryDto.parentCategoryId);
      updateCategoryDto.parentCategoryId = parentCategory.id;
    }

    updateCategoryDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateCategoryDto.name);

    const isCategoryTaken = await this.checkIfCategoryIsAlreadyTaken(updateCategoryDto.name, id);

    if (!isCategoryTaken) {
      throw new NotAcceptableException(`Category ${updateCategoryDto.name} is already taken.`);
    }

    if (updateCategoryDto.image) {
      category.imageUrl && await this.uploadService.deleteImage(category.imageUrl);

      updateCategoryDto.imageUrl = await this.uploadService.uploadImage(
        updateCategoryDto.image,
        updateCategoryDto.name,
        'categories',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        ...(updateCategoryDto.parentCategoryId && { parentCategoryId: updateCategoryDto.parentCategoryId }),
        ...(updateCategoryDto.imageUrl && { imageUrl: updateCategoryDto.imageUrl }),
        ...(updateCategoryDto.businessCategoryId && { businessCategoryId: updateCategoryDto.businessCategoryId }),
      },
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    category.imageUrl && await this.uploadService.deleteImage(category.imageUrl);
    return this.prisma.category.delete({ where: { id } });
  }

  private async checkIfCategoryIsAlreadyTaken(name: string, id?: number): Promise<boolean> {
    const existingCategory = await this.prisma.category.findUnique({ where: { name } });

    if (id) {
      return existingCategory ? existingCategory.id === id : true;
    }

    return !!existingCategory;
  }
}
