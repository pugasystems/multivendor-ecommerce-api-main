import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleEntity } from './entities/role.entity';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { CommonQuery } from 'src/interfaces/query.interface';
import { Roles } from './entities/roles.entity';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const name = capitalizeFirstLetterOfEachWordInAPhrase(createRoleDto.name);

    const doesRoleExist: boolean = await this.checkIfRoleExist(name);

    if (doesRoleExist) {
      throw new NotAcceptableException('A role with the provided name already exists');
    }

    return this.prisma.role.create({ data: { name } });
  }

  async findAll(query: CommonQuery): Promise<Roles> {
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

    const [totalCount, roles] = await this.prisma.$transaction([
      this.prisma.role.count({ where: whereClause }),
      this.prisma.role.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
      }),
    ]);

    return { totalCount, roles };
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findFirst({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Unable to find the role with id ${id}`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);

    const name = capitalizeFirstLetterOfEachWordInAPhrase(updateRoleDto.name);

    const doesRoleExist: boolean = await this.checkIfRoleExist(name, id);

    if (!doesRoleExist) {
      throw new NotAcceptableException('A role with the provided name already exists');
    }

    return this.prisma.role.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.role.delete({ where: {id} });
  }

  async findRoleByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name }});

    if (!role) {
      throw new NotAcceptableException(`Role ${name} does not exist`);
    }

    return role;
  }

  private async checkIfRoleExist(name: string, id?: number): Promise<boolean> {
    const role = await this.prisma.role.findUnique({ where: { name, }, });

    if (id) {
      return role ? role.id === id : true;
    }

    return !!role;
  }
}
