import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { CityEntity } from './entities/city.entity';
import { Cities } from './entities/cities.entity';
import { CityQuery, CommonQuery } from 'src/interfaces/query.interface';
import { DistrictsService } from 'src/districts/districts.service';

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly districtService: DistrictsService,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<CityEntity> {
    await this.districtService.findOne(createCityDto.districtId);

    createCityDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createCityDto.name);

    const doesDistrictExists = await this.checkIfCityExistsInADistrict(
      createCityDto.name, createCityDto.districtId,
    );

    if (doesDistrictExists) {
      throw new NotAcceptableException(`A city with the given name already exists`);
    }

    return this.prisma.city.create({ data: createCityDto });
  }

  async findAll(query: CityQuery): Promise<Cities> {
    const whereClause: { AND?: object[] } = {
      AND: [
        ...(query.stateId ? [{ stateId: +query.stateId }]: []),
        ...(query.search ? [
          {
            OR: [
              {
                name: {
                  contains: query.search,
                },
              }
            ],
          },
        ] : [])
      ],
    };

    const [totalCount, cities] = await this.prisma.$transaction([
      this.prisma.city.count({ where: whereClause }),
      this.prisma.city.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, cities };
  }

  async findOne(id: number): Promise<CityEntity> {
    const city = await this.prisma.city.findFirst({ where: { id } });

    if (!city) {
      throw new NotFoundException(`Unable to find the city with id ${id}`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<CityEntity> {
    await Promise.all([
      this.findOne(id),
      this.districtService.findOne(updateCityDto.districtId),
    ]);

    updateCityDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateCityDto.name);

    const doesDistrictExists = await this.checkIfCityExistsInADistrict(
      updateCityDto.name, updateCityDto.districtId, id,
    );

    if (!doesDistrictExists) {
      throw new NotAcceptableException(`A city with the given name already exists`);
    }

    return this.prisma.city.update({ where: { id }, data: updateCityDto });
  }

  async remove(id: number): Promise<CityEntity> {
    await this.findOne(id);
    return this.prisma.city.delete({ where: { id } });
  }

  private async checkIfCityExistsInADistrict(
    name: string, districtId: number, id?: number,
  ): Promise<boolean> {
    const city = await this.prisma.city.findFirst({ where: { districtId, name } });

    if (id) {
      return city ? city.id === id : true;
    }

    return !!city;
  }
}
