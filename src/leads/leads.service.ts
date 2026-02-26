import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { LeadsQuery } from 'src/interfaces/query.interface';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const [user, product] = await Promise.all([
      this.userService.findOne(+createLeadDto.userId),
      this.productService.findOne(+createLeadDto.productId),
    ]);

    const { _max } = await this.prisma.product.aggregate({
      where: { categoryId: product.categoryId },
      _max: {
        price: true,
      },
    });

    const { _min } = await this.prisma.product.aggregate({
      where: { categoryId: product.categoryId },
      _min: {
        price: true,
      }
    });

    createLeadDto.possibleOrderValue = (_min.price === _max.price)
      ? `$${_min.price}`
      : `$${_min.price} - $${_max.price}`;

    createLeadDto.businessCategoryId = product.category.businessCategoryId;

    return this.prisma.lead.create({ data: createLeadDto });
  }

  async findAll(query: LeadsQuery) {
    const { vendorId, businessCategoryId, search } = query;

    const whereClause: { AND?: object[] } = {
      AND: [
        ...(vendorId ? [{ vendorId }] : [{ vendorId: null }]),
        ...(businessCategoryId ? [{ businessCategoryId }] : []),
        ...(search ? [
          {
            OR: [
              {
                vendor: {
                  OR: [
                    { name: { contains: search } },
                    {
                      businessCategory: { name: { contains: search } },
                    }
                  ],
                }
              },
              {
                product: {
                  OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                    { category: { name: { contains: search } } },
                  ],
                },
              },
            ],
          },
        ] : []),
      ]
    };

    const [totalCount, leads] = await this.prisma.$transaction([
      this.prisma.lead.count({ where: whereClause }),
      this.prisma.lead.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: {
          product: {
            select: {
              name: true,
              description: true,
              quantity: true,
              price: true,
              attributes: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          vendor: {
            select: {
              name: true,
              businessCategory: {
                select: {
                  name: true
                },
              },
            },
          },
          user: {
            select: {
              userAddresses: {
                select: {
                  addressLineOne: true,
                  cityId: true,
                  stateId: true,
                  city: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  state: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              }
            },
          },
        },
      }),
    ]);

    return { totalCount, leads };
  }

  findOne(id: number) {
    return `This action returns a #${id} lead`;
  }

  update(id: number, updateLeadDto: UpdateLeadDto) {
    return `This action updates a #${id} lead`;
  }

  remove(id: number) {
    return `This action removes a #${id} lead`;
  }
}
