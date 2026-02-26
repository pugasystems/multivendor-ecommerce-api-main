import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatesService } from 'src/states/states.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { DistrictEntity } from './entities/district.entity';
import { Districts } from './entities/districts.entity';
import { CommonQuery } from 'src/interfaces/query.interface';

@Injectable()
export class DistrictsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: StatesService,
  ) {}

  async create(createDistrictDto: CreateDistrictDto): Promise<DistrictEntity> {
    await this.stateService.findOne(createDistrictDto.stateId);

    createDistrictDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createDistrictDto.name);

    const doesDistrictExists = await this.checkIfDistrictExistsInAState(
      createDistrictDto.name, createDistrictDto.stateId,
    );

    if (doesDistrictExists) {
      throw new NotAcceptableException(`A district with the given name already exists`);
    }

    return this.prisma.district.create({ data: createDistrictDto });
  }

  async findAll(query: CommonQuery): Promise<Districts> {
    const whereClause: { AND?: object[] } = {};

    if (query.search) {
      whereClause.AND = [
        {
          OR: [
            {
              name: {
                contains: query.search,
              },
            }
          ],
        },
      ];
    }

    const [totalCount, districts] = await this.prisma.$transaction([
      this.prisma.district.count({ where: whereClause }),
      this.prisma.district.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, districts };
  }

  async findOne(id: number): Promise<DistrictEntity> {
    const district = await this.prisma.district.findFirst({ where: { id } });

    if (!district) {
      throw new NotFoundException(`Unable to find the district with id ${id}`);
    }

    return district;
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto): Promise<DistrictEntity> {
    await Promise.all([
      this.findOne(id),
      this.stateService.findOne(updateDistrictDto.stateId),
    ]);

    updateDistrictDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateDistrictDto.name);

    const doesDistrictExists = await this.checkIfDistrictExistsInAState(
      updateDistrictDto.name, updateDistrictDto.stateId, id,
    );

    if (!doesDistrictExists) {
      throw new NotAcceptableException(`A district with the given name already exists`);
    }

    return this.prisma.district.update({ where: { id }, data: updateDistrictDto });
  }

  async remove(id: number): Promise<DistrictEntity> {
    await this.findOne(id);
    return this.prisma.district.delete({ where: { id } });
  }

  private async checkIfDistrictExistsInAState(
    name: string, stateId: number, id?: number,
  ): Promise<boolean> {
    const district = await this.prisma.district.findFirst({ where: { stateId, name } });

    if (id) {
      return district ? district.id === id : true;
    }

    return !!district;
  }
}
