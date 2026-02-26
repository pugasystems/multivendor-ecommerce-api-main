import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CountriesService } from 'src/countries/countries.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { StateEntity } from './entities/state.entity';
import { CommonQuery, StateQuery } from 'src/interfaces/query.interface';
import { States } from './entities/states.entity';

@Injectable()
export class StatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly  countryService: CountriesService,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<StateEntity> {
    await this.countryService.findOne(createStateDto.countryId);

    createStateDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createStateDto.name);

    const doesStateExist = await this.checkIfStateExists(createStateDto.name);

    if (doesStateExist) {
      throw new NotAcceptableException(`A state with the given name already exists`);
    }

    return this.prisma.state.create({ data: createStateDto });
  }

  async findAll(query: StateQuery): Promise<States> {
    const whereClause: { AND?: object[] } = {
      AND: [
        ...(query.countryId ? [{ countryId: +query.countryId }]: []),
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

    const [totalCount, states] = await this.prisma.$transaction([
      this.prisma.state.count({ where: whereClause }),
      this.prisma.state.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, states };
  }

  async findOne(id: number): Promise<StateEntity> {
    const state = await this.prisma.state.findFirst({ where: { id } });

    if (!state) {
      throw new NotFoundException(`Unable to find the state with id ${id}`);
    }

    return state;
  }

  async update(id: number, updateStateDto: UpdateStateDto): Promise<StateEntity> {
    await Promise.all([
      this.findOne(id),
      this.countryService.findOne(updateStateDto.countryId),
    ]);

    updateStateDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateStateDto.name);

    const doesStateExist = await this.checkIfStateExists(updateStateDto.name, id);

    if (!doesStateExist) {
      throw new NotAcceptableException(`A state with the given name already exists`);
    }

    return this.prisma.state.update({ where: { id }, data: updateStateDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.state.delete({ where: { id } });
  }

  private async checkIfStateExists(name: string, id?: number): Promise<boolean> {
    const state = await this.prisma.state.findUnique({ where: { name }, });

    if (id) {
      return state ? state.id === id : true;
    }

    return !!state;
  }
}
