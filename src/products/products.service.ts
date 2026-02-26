import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';
import { VendorsService } from 'src/vendors/vendors.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { ProductEntity } from './entities/product.entity';
import { ProductQuery } from 'src/interfaces/query.interface';
import { Products } from './entities/products.entity';
import { UploadService } from 'src/upload-service/upload.service';
import { randomInt } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoriesService,
    private readonly vendorService: VendorsService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const [category, vendor] = await Promise.all([
      this.categoryService.findOne(+createProductDto.categoryId),
      this.vendorService.findOne(+createProductDto.vendorId),
    ]);

    createProductDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createProductDto.name);

    const { attributes, images, ...payload } = createProductDto;

    return this.prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({ data: payload });

      if (attributes?.length) {
        const attributesMap = attributes.map(attribute => {
          return {
            name: attribute.name,
            value: attribute.value,
            productId: createdProduct.id,
          };
        });

        await tx.productAttribute.createMany({ data: attributesMap });
      }

      if (images?.length) {
        let imageUrl: string;

        const imagesMap = [];

        for await (const image of images) {
          imageUrl = await this.uploadService.uploadImage(
            image.image,
            `${createdProduct.id}-${category.id}-${vendor.id}-${randomInt(9999)}`,
            'products',
          );

          imagesMap.push({
            imageUrl,
            productId: createdProduct.id,
          });
        }

        await tx.productImage.createMany({ data: imagesMap });
      }

      return createdProduct;
    }, {
      timeout: 30000,
    });
  }

  async findAll(query: ProductQuery): Promise<Products> {
    const { categoryId, vendorId, search, countryId, stateId, cityId, districtId } = query;

    const whereClause: { AND?: object[] } = {
      AND: [
        ...(categoryId ? [{ categoryId }] : []),
        ...(vendorId ? [{ vendorId }] : []),
        ...(countryId ? [{ vendor: { userAddress: { AND: [{ countryId }] } } }] : []),
        ...(stateId ? [{ vendor: { userAddress: { AND: [{ stateId }] } } }] : []),
        ...(districtId ? [{ vendor: { userAddress: { AND: [{ districtId }] } } }] : []),
        ...(cityId ? [{ vendor: { userAddress: { AND: [{ cityId }] } } }] : []),
        ...(search ? [
          {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              {
                category: {
                  OR: [
                    { name: { contains: search } },
                    { businessCategory: { name: { contains: search } } },
                  ],
                },
              },
              {
                vendor: {
                  OR: [
                    { name: { contains: search } },
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
              },
            ],
          },
        ] : []),
      ],
    };

    const [totalCount, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where: whereClause }),
      this.prisma.product.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: {
          attributes: true,
          images: true,
          category: true,
          vendor: {
            include: {
              userAddress: {
                include: {
                  country: true,
                  state: true,
                  district: true,
                  city: true,
                }
              }
            }
          },
        },
      }),
    ]);

    return { totalCount, products };
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findFirst({
      where: { id },
      include: {
        attributes: true,
        images: true,
        category: true,
        vendor: {
          include: {
            userAddress: {
              include: {
                country: true,
                state: true,
                district: true,
                city: true,
              }
            }
          }
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Unable to find the product with id ${id}`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    const updatedAttributes = [];
    const updateAttributesWithCommonName = [];

    const [product, category, vendor] = await Promise.all([
      this.findOne(id),
      this.categoryService.findOne(+updateProductDto.categoryId),
      this.vendorService.findOne(+updateProductDto.vendorId),
    ]);

    updateProductDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateProductDto.name);

    const { attributes, images, ...payload } = updateProductDto;

    if (attributes?.length && product.attributes?.length) {
      for (const attribute of updateProductDto.attributes) {
        const existingAttribute = product.attributes.find(
          a => a.name === attribute.name
        );

        if (existingAttribute) {
          if (existingAttribute.value !== attribute.value) {
            updateAttributesWithCommonName.push({ id: existingAttribute.id, value: attribute.value });
          }
        } else {
          attribute.productId = product.id;
          updatedAttributes.push(attribute);
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({ where: { id }, data: payload });

      if (updatedAttributes.length) {
        await tx.productAttribute.createMany({ data: updatedAttributes });
      }

      await Promise.all(
        updateAttributesWithCommonName.map(async (a) => {
          await tx.productAttribute.update({ where: { id: a.id }, data: { value: a.value } });
        }),
      );

      if (images?.length) {
        let imageUrl: string;

        const imagesMap = [];

        for await (const image of images) {
          imageUrl = await this.uploadService.uploadImage(
            image.image,
            `${product.id}-${category.id}-${vendor.id}-${randomInt(9999)}`,
            'products',
          );

          imagesMap.push({
            imageUrl,
            productId: product.id,
          });
        }

        await tx.productImage.createMany({ data: imagesMap });
      }

      return updatedProduct;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async deleteProductImage(id: number) {
    const productImage = await this.prisma.productImage.findFirst({ where: { id }, });

    if (!productImage) {
      throw new NotFoundException(`Unable to find the image with id ${id}`);
    }

    await this.uploadService.deleteImage(productImage.imageUrl);

    return this.prisma.productImage.delete({ where: { id } });
  }
}
