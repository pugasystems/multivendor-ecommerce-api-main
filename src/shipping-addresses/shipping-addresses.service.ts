import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CountriesService } from 'src/countries/countries.service';
import { StatesService } from 'src/states/states.service';
import { DistrictsService } from 'src/districts/districts.service';
import { CitiesService } from 'src/cities/cities.service';
import { UsersService } from 'src/users/users.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { ShippingAddressEntity } from './entities/shipping-address.entity';
import { ShippingAddressQuery } from 'src/interfaces/query.interface';
import { ShippingAddresses } from './entities/shipping-addresses.entity';

@Injectable()
export class ShippingAddressesService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly countryService: CountriesService,
    private readonly stateService: StatesService,
    private readonly districtService: DistrictsService,
    private readonly cityService: CitiesService,
    private readonly userService: UsersService,
  ) {}

  async create(createShippingAddressDto: CreateShippingAddressDto): Promise<ShippingAddressEntity> {
    await Promise.all([
      this.userService.findOne(createShippingAddressDto.userId),
      this.countryService.findOne(createShippingAddressDto.countryId),
      this.stateService.findOne(createShippingAddressDto.stateId),
      this.cityService.findOne(createShippingAddressDto.cityId),
    ]);

    if (createShippingAddressDto.districtId) {
      await this.districtService.findOne(createShippingAddressDto.districtId);
    }

    createShippingAddressDto.addressLineOne = capitalizeFirstLetterOfEachWordInAPhrase(createShippingAddressDto.addressLineOne);

    if (createShippingAddressDto.addressLineTwo) {
      createShippingAddressDto.addressLineTwo = capitalizeFirstLetterOfEachWordInAPhrase(createShippingAddressDto.addressLineTwo);
    }

    createShippingAddressDto.isDefault = await this.changeOrCreateDefaultAddress(createShippingAddressDto.userId);

    return this.prisma.userAddress.create({
      data: createShippingAddressDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            isActive: true,
            hasVerified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
            role: true,
          },
        },
        country: true,
        state: true,
        district: true,
        city: true,
      },
    });
  }

  async findAll(query: ShippingAddressQuery): Promise<ShippingAddresses> {
    const { userId, countryId, stateId, districtId, cityId, search } = query;

    const whereClause: { AND?: object[] } = {
      AND: [
        ...(userId ? [{ userId }] : []),
        ...(countryId ? [{ countryId }] : []),
        ...(stateId ? [{ stateId }] : []),
        ...(districtId ? [{ districtId }] : []),
        ...(cityId ? [{ cityId }] : []),
        ...(search ? [
          {
            OR: [
              { addressLineOne: { contains: search } },
              { addressLineTwo: { contains: search } },
              { country: { name: { contains: search } } },
              { state: { name: { contains: search } } },
              { district: { name: { contains: search } } },
              { city: { name: { contains: search } } },
            ],
          },
        ] : []),
      ],
    };

    const [totalCount, userAddresses] = await this.prisma.$transaction([
      this.prisma.userAddress.count({ where: whereClause }),
      this.prisma.userAddress.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              email: true,
              isActive: true,
              hasVerified: true,
              verifiedAt: true,
              createdAt: true,
              updatedAt: true,
              role: true,
            },
          },
          country: true,
          state: true,
          district: true,
          city: true,
        },
      }),
    ]);

    return { totalCount, userAddresses };
  }

  async findOne(id: number): Promise<ShippingAddressEntity> {
    const userAddress = await this.prisma.userAddress.findFirst({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            isActive: true,
            hasVerified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
            role: true,
          },
        },
        country: true,
        state: true,
        district: true,
        city: true,
      },
    });

    if (!userAddress) {
      throw new NotFoundException(`Unable to find the address with id ${id}`);
    }

    return userAddress;
  }

  async update(id: number, updateShippingAddressDto: UpdateShippingAddressDto): Promise<ShippingAddressEntity> {
    await Promise.all([
      this.findOne(id),
      this.userService.findOne(updateShippingAddressDto.userId),
      this.countryService.findOne(updateShippingAddressDto.countryId),
      this.stateService.findOne(updateShippingAddressDto.stateId),
      this.cityService.findOne(updateShippingAddressDto.cityId),
    ]);

    if (updateShippingAddressDto.districtId) {
      await this.districtService.findOne(updateShippingAddressDto.districtId);
    }

    updateShippingAddressDto.addressLineOne = capitalizeFirstLetterOfEachWordInAPhrase(updateShippingAddressDto.addressLineOne);

    if (updateShippingAddressDto.addressLineTwo) {
      updateShippingAddressDto.addressLineTwo = capitalizeFirstLetterOfEachWordInAPhrase(updateShippingAddressDto.addressLineTwo);
    }

    if (updateShippingAddressDto.isDefault) {
      updateShippingAddressDto.isDefault = await this.changeOrCreateDefaultAddress(updateShippingAddressDto.userId, id);
    }

    return this.prisma.userAddress.update({
      where: { id },
      data: updateShippingAddressDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            isActive: true,
            hasVerified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
            role: true,
          },
        },
        country: true,
        state: true,
        district: true,
        city: true,
      },
    });
  }

  async remove(id: number): Promise<ShippingAddressEntity> {
    await this.findOne(id);
    return this.prisma.userAddress.delete({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            isActive: true,
            hasVerified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
            role: true,
          },
        },
        country: true,
        state: true,
        district: true,
        city: true,
      },
    });
  }

  private async changeOrCreateDefaultAddress(userId: number, id?: number): Promise<boolean> {
    const defaultUserAddress = await this.prisma.userAddress.findFirst({ where: { userId, isDefault: true } });

    if (!defaultUserAddress) {
      return true;
    }

    if (id && defaultUserAddress.id !== id) {
      await this.prisma.userAddress.update({ where: { id: defaultUserAddress.id }, data: { isDefault: false } });
    }

    return true;
  }
}
