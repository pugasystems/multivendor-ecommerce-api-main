import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateBusinessCategoryDto } from './dto/create-business-category.dto';
import { UpdateBusinessCategoryDto } from './dto/update-business-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { CommonQuery } from 'src/interfaces/query.interface';
import { BusinessCategoryEntity } from './entities/business-category.entity';
import { BusinessCategories } from './entities/business-categories.entity';

@Injectable()
export class BusinessCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBusinessCategoryDto: CreateBusinessCategoryDto): Promise<BusinessCategoryEntity> {
    const name = capitalizeFirstLetterOfEachWordInAPhrase(createBusinessCategoryDto.name);

    const doesBusinessCategoryExist: boolean = await this.checkIfBusinessCategoryExist(name);

    if (doesBusinessCategoryExist) {
      throw new NotAcceptableException('A business category with the provided name already exists');
    }

    return this.prisma.businessCategory.create({ data: { name } });
  }

  async findAll(query: CommonQuery): Promise<BusinessCategories> {
    const whereClause: { AND?: object[] } = {};

    if (query.search) {
      whereClause.AND = [
        {
          OR: [
            {
              name: {
                contains: query.search,
              },
            },
          ],
        },
      ];
    }

    const [totalCount, businessCategories] = await this.prisma.$transaction([
      this.prisma.businessCategory.count({ where: whereClause }),
      this.prisma.businessCategory.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, businessCategories };
  }

  async findOne(id: number): Promise<BusinessCategoryEntity> {
    const businessCategory = await this.prisma.businessCategory.findFirst({ where: { id } });

    if (!businessCategory) {
      throw new NotFoundException(`Unable to find the role with id ${id}`);
    }

    return businessCategory;
  }

  async update(id: number, updateBusinessCategoryDto: UpdateBusinessCategoryDto): Promise<BusinessCategoryEntity> {
    await this.findOne(id);

    const name = capitalizeFirstLetterOfEachWordInAPhrase(updateBusinessCategoryDto.name);

    const doesBusinessCategoryExist: boolean = await this.checkIfBusinessCategoryExist(name, id);

    if (!doesBusinessCategoryExist) {
      throw new NotAcceptableException('A business category with the provided name already exists');
    }

    return this.prisma.businessCategory.update({ where: { id }, data: { name } });
  }

  async remove(id: number): Promise<BusinessCategoryEntity> {
    await this.findOne(id);
    return this.prisma.businessCategory.delete({ where: { id } });
  }

  private async checkIfBusinessCategoryExist(name: string, id?: number): Promise<boolean> {
    const businessCategory = await this.prisma.businessCategory.findUnique({ where: { name, }, });

    if (id) {
      return businessCategory ? businessCategory.id === id : true;
    }

    return !!businessCategory;
  }
}
