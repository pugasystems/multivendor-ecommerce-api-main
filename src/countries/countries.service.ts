import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { CommonQuery } from 'src/interfaces/query.interface';
import { CountryEntity } from './entities/country.entity';
import { Countries } from './entities/countries.entity';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryEntity> {
    createCountryDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createCountryDto.name);

    if (createCountryDto.abbreviation) {
      createCountryDto.abbreviation = createCountryDto.abbreviation.toUpperCase();
    }

    const doesCountryExist = await this.checkIfCountryExists(createCountryDto.name);

    if (doesCountryExist) {
      throw new NotAcceptableException(`A Country with the given name already exists`);
    }

    return this.prisma.country.create({ data: createCountryDto });
  }

  async findAll(query: CommonQuery): Promise<Countries> {
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

    const [totalCount, countries] = await this.prisma.$transaction([
      this.prisma.country.count({ where: whereClause }),
      this.prisma.country.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, countries };
  }

  async findOne(id: number): Promise<CountryEntity> {
    const country = await this.prisma.country.findFirst({ where: { id } });

    if (!country) {
      throw new NotFoundException(`Unable to find the country with id ${id}`);
    }

    return country;
  }

  async update(id: number, updateCountryDto: UpdateCountryDto): Promise<CountryEntity> {
    await this.findOne(id);

    updateCountryDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateCountryDto.name);

    if (updateCountryDto.abbreviation) {
      updateCountryDto.abbreviation = updateCountryDto.abbreviation.toUpperCase();
    }

    const doesCountryExist = await this.checkIfCountryExists(updateCountryDto.name, id);

    if (!doesCountryExist) {
      throw new NotAcceptableException(`A Country with the given name already exists`);
    }

    return this.prisma.country.update({ where: { id },  data: updateCountryDto });
  }

  async remove(id: number): Promise<CountryEntity> {
    await this.findOne(id);
    return this.prisma.country.delete({ where: { id } });
  }

  private async checkIfCountryExists(name: string, id?: number): Promise<boolean> {
    const country = await this.prisma.country.findUnique({ where: { name }, });

    if (id) {
      return country ? country.id === id : true;
    }

    return !!country;
  }
}
