import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { BusinessCategoriesService } from 'src/business-categories/business-categories.service';
import { ShippingAddressesService } from 'src/shipping-addresses/shipping-addresses.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { VendorEntity } from './entities/vendor.entity';
import { VendorQuery } from 'src/interfaces/query.interface';
import { Vendors } from './entities/vendors.entity';
import { parse } from 'csv-parse/sync';
import { UploadFileDto } from './dto/upload-file.dto';
import { hash } from 'bcrypt';
import { PaymentStatus, VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly userAddressService: ShippingAddressesService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly businessCategoryService: BusinessCategoriesService,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<VendorEntity> {
    const [user, userAddress, subscription, businessCategory] = await Promise.all([
      this.userService.findOne(createVendorDto.userId),
      this.userAddressService.findOne(createVendorDto.userAddressId),
      this.subscriptionService.findOne(createVendorDto.subscriptionId),
      this.businessCategoryService.findOne(createVendorDto.businessCategoryId),
    ]);

    createVendorDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createVendorDto.name);
    createVendorDto.leadsCount = subscription.leadsCount;

    const { subscriptionId, ...payload } = createVendorDto;

    return this.prisma.vendor.create({
      data: {
        ...payload,
        subscriptions: {
          create: [
            {
              subscription: {
                connect: {
                  id: subscriptionId,
                },
              }
            }
          ],
        },
      },
      include: {
        userAddress: {
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
        },
        businessCategory: true,
      },
    });
  }

  async findAll(query: VendorQuery): Promise<Vendors> {
    const { userId, userAddressId, search } = query;

    const whereClause: { AND?: object[] } = {
      AND: [
        ...(userId ? [{ userId }] : []),
        ...(userAddressId ? [{ userAddressId }] : []),
        ...(search ? [
          {
            OR: [
              { name: { contains: search } },
              { businessCategory: { name: { contains: search } } },
              {
                userAddress: {
                  OR: [
                    { addressLineOne: { contains: search } },
                    { addressLineTwo: { contains: search } },
                    { country: { name: { contains: search } } },
                    { state: { name: { contains: search } } },
                    { district: { name: { contains: search } } },
                    { city: { name: { contains: search } } },
                  ],
                },
              },
            ],
          },
        ] : [])
      ],
    };

    const [totalCount, vendors] = await this.prisma.$transaction([
      this.prisma.vendor.count({ where: whereClause }),
      this.prisma.vendor.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: {
          userAddress: {
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
          },
          businessCategory: true,
        },
      }),
    ]);

    return { totalCount, vendors };
  }

  async findOne(id: number): Promise<VendorEntity> {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id },
      include: {
        userAddress: {
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
        },
        subscriptions: true,
        businessCategory: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Unable to find the vendor with id ${id}`);
    }

    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<VendorEntity> {
    const [vendor, user, userAddress, subscription, businessCategory] = await Promise.all([
      this.findOne(id),
      this.userService.findOne(updateVendorDto.userId),
      this.userAddressService.findOne(updateVendorDto.userAddressId),
      this.subscriptionService.findOne(updateVendorDto.subscriptionId),
      this.businessCategoryService.findOne(updateVendorDto.businessCategoryId),
    ]);

    updateVendorDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateVendorDto.name);

    const { subscriptionId, ...payload } = updateVendorDto;

    return this.prisma.vendor.update({
      where: { id },
      data: payload,
      include: {
        userAddress: {
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
        },
        businessCategory: true,
      },
    });
  }

  async remove(id: number): Promise<VendorEntity> {
    await this.findOne(id);
    return this.prisma.vendor.delete({
      where: { id },
      include: {
        userAddress: {
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
        },
        businessCategory: true,
      },
    });
  }

  async bulkUpload(uploadFileDto: UploadFileDto) {
    const csvData = Buffer.from(uploadFileDto.file, 'base64').toString('utf-8');

    const records = parse(csvData, { columns: false, skip_empty_lines: true });

    records.shift();

    const filteredRecords = records.filter(record => record[6] !== '');

    let firstName: string;
    let lastName: string;
    let mobileNumber: string;
    let password: string;
    let addressLineOne: string;
    let zipCode: string|null;
    let vendorName: string;

    const [vendorRole, countryUsa, freeSubscription] = await Promise.all([
      this.prisma.role.upsert({
        where: { name: "Vendor" },
        update: {},
        create: {
          name: "Vendor",
        },
      }),
      this.prisma.country.upsert({
        where: { name: "United States Of America" },
        update: {},
        create: {
          name: "United States Of America",
          abbreviation: "USA",
        },
      }),
      this.prisma.subscription.upsert({
        where: { name: "Single Buy Lead" },
        update: {},
        create: {
          name: "Single Buy Lead",
          description: "Minimalistic option for personal use & for your next lead.",
          leadsCount: 1,
          price: 2,
        },
      }),
    ]);

    const [ monthlySubscription, annualSubscription ] = await Promise.all([
      this.prisma.subscription.create({
        data: {
          name: "Montly Plan",
          description: "Standard option for business use & for your next leads.",
          leadsCount: 60,
          price: 50,
        },
      }),

      this.prisma.subscription.create({
        data: {
          name: "Yearly Plan",
          description: "Premium option for business use & for your next leads.",
          leadsCount: 885,
          price: 200,
        },
      }),
    ]);

    await this.prisma.subscriptionItem.createMany({
      data: [
        {
          subscriptionId: freeSubscription.id,
          text: "1 Buy Lead",
        },
        {
          subscriptionId: freeSubscription.id,
          text: "Get Buyer Contact details via e-mail & SMS",
        },
      ],
    });

    await this.prisma.subscriptionItem.createMany({
      data: [
        {
          subscriptionId: monthlySubscription.id,
          text: "60 Buy Leads",
        },
        {
          subscriptionId: monthlySubscription.id,
          text: "More business enquiries by e-mail & call",
        },
        {
          subscriptionId: monthlySubscription.id,
          text: "Higher Listing on GetBizzUsa",
        },
        {
          subscriptionId: monthlySubscription.id,
          text: "Dedicated Account Manager",
        },
        {
          subscriptionId: monthlySubscription.id,
          text: "Comprehensive Lead Management System",
        },
        {
          subscriptionId: monthlySubscription.id,
          text: "Get Buyer Contact details via e-mail & SMS",
        },
      ],
    });

    await this.prisma.subscriptionItem.createMany({
      data: [
        {
          subscriptionId: annualSubscription.id,
          text: "60 Buy Leads",
        },
        {
          subscriptionId: annualSubscription.id,
          text: "More business enquiries by e-mail & call",
        },
        {
          subscriptionId: annualSubscription.id,
          text: "Higher Listing on GetBizzUsa",
        },
        {
          subscriptionId: annualSubscription.id,
          text: "Dedicated Account Manager",
        },
        {
          subscriptionId: annualSubscription.id,
          text: "Comprehensive Lead Management System",
        },
        {
          subscriptionId: annualSubscription.id,
          text: "Get Buyer Contact details via e-mail & SMS",
        },
      ],
    });

    for await (const record of filteredRecords) {
      if (record[2] === "") {
        firstName = "Unknown";
        lastName = "User";
      } else {
        [firstName, lastName] = record[2].split(" ").map((substr: string) => substr.trim());
      }

      vendorName = (record[0] !== "") ? record[0] : "Not Provided";
      addressLineOne = (record[3] !== "") ? record[3] : "Not provided";
      zipCode = (record[12] !== "") ? record[12] : null;

      mobileNumber = record[6];
      password = await hash(mobileNumber, parseInt(process.env.SALT_ROUNDS));

      await this.prisma.$transaction(async (tx) => {
        const businessCategory = await tx.businessCategory.upsert({
          where: { name: record[10] },
          update: {},
          create: {
            name: record[10],
          },
        });

        const user = await tx.user.upsert({
          where: { mobileNumber, },
          update: {},
          create: {
            firstName: firstName ?? "Unknown",
            lastName: lastName ?? "User",
            mobileNumber,
            password,
            isActive: true,
            hasVerified: true,
            verifiedAt: new Date(),
            role: {
              connect: {
                id: vendorRole.id,
              }
            }
          },
        });

        const state = await tx.state.upsert({
          where: { name: record[5] },
          update: {},
          create: {
            name: record[5],
            countryId: countryUsa.id,
          },
        });

        let city = await tx.city.findFirst({ where: { name: record[4], stateId: state.id } });

        if (!city) {
          city = await tx.city.create({ data: { name: record[4], stateId: state.id } });
        }

        const userAddress = await tx.userAddress.create({
          data: {
            addressLineOne,
            zipCode,
            isDefault: true,
            userId: user.id,
            countryId: countryUsa.id,
            stateId: state.id,
            cityId: city.id,
          },
        });

        await tx.vendor.create({
          data: {
            name: vendorName,
            vendorStatus: VendorStatus.trial,
            paymentStatus: PaymentStatus.unpaid,
            leadsCount: 0,
            userId: user.id,
            userAddressId: userAddress.id,
            businessCategoryId: businessCategory.id,
            subscriptions: {
              create: [
                {
                  subscription: {
                    connect: {
                      id: freeSubscription.id,
                    }
                  }
                },
              ],
            }
          },
        });
      });
    }
  }

  async getVendorSubscriotions(id: number) {
    return this.prisma.subscriptionOnVendor.findMany({ where: { vendorId: id }, include: { subscription: true } });
  }

  async buySubscription(id: number, subscriptionId: number) {
    const [subscription, vendor] = await Promise.all([
      this.subscriptionService.findOne(subscriptionId),
      this.findOne(id),
    ]);

    const leadsCount = vendor.leadsCount + subscription.leadsCount;

    return this.prisma.$transaction(async (tx) => {
      const updatedVendor = await tx.vendor.update({
        where: { id },
        data: { leadsCount }
      });

      await tx.subscriptionOnVendor.create({
        data: {
          subscriptionId,
          vendorId: updatedVendor.id,
        },
      });

      return updatedVendor;
    });
  }

  async contactLead(vendorId: number, leadId: number) {
    const [vendor, lead] = await Promise.all([
      this.findOne(vendorId),
      this.prisma.lead.findFirst({ where: { id: leadId } }),
    ]);

    if (!lead) {
      throw new NotFoundException("Unable to find the lead");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          leadsConsumed: vendor.leadsConsumed + 1,
          leadsCount: vendor.leadsCount - 1,
        },
      });

      await tx.lead.update({ where: { id: leadId }, data: { vendorId: vendorId } });
    });
  }
}
