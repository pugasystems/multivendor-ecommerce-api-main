import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase } from 'src/helpers/capitalize';
import { SubscriptionEntity } from './entities/subscription.entity';
import { CommonQuery } from 'src/interfaces/query.interface';
import { Subscriptions } from './entities/subscriptions.entity';

@Injectable()
export class SubscriptionsService {
  constructor (private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    createSubscriptionDto.name = capitalizeFirstLetterOfEachWordInAPhrase(createSubscriptionDto.name);

    const checkIfNameExists = await this.checkIfNameExists(createSubscriptionDto.name);

    if (checkIfNameExists) {
      throw new NotAcceptableException(`A subscription with the name "${createSubscriptionDto.name}" already exists.`);
    }

    const { attributes, items, ...payload } = createSubscriptionDto;

    return this.prisma.$transaction(async (tx) => {
      const createdSubscription = await tx.subscription.create({ data: payload });

      if (attributes?.length) {
        const attributesMap = attributes.map(attribute => {
          return {
            name: attribute.name,
            value: attribute.value,
            subscriptionId: createdSubscription.id,
          };
        });

        await tx.subscriptionAttribute.createMany({ data: attributesMap });
      }

      if (items?.length) {
        const itemsMap = items.map(item => {
          const { icon, tag } = item;
          return {
            ...(icon && { icon }),
            ...(tag && { tag }),
            text: item.text,
            subscriptionId: createdSubscription.id,
          };
        });

        await tx.subscriptionItem.createMany({ data: itemsMap });
      }

      return createdSubscription;
    });
  }

  async findAll(query: CommonQuery): Promise<Subscriptions> {
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
            {
              description: {
                contains: query.search,
              },
            }
          ],
        },
      ];
    }

    const [totalCount, subscriptions] = await this.prisma.$transaction([
      this.prisma.subscription.count({ where: whereClause }),
      this.prisma.subscription.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: { attributes: true, items: true },
      }),
    ]);

    return { totalCount, subscriptions };
  }

  async findOne(id: number): Promise<SubscriptionEntity> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id },
      include: { attributes: true, items: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Unable to find the subscription with id ${id}`);
    }

    return subscription;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionEntity> {
    const updatedAttributes = [];
    const updatedAttributesWithCommonName = [];
    const updatedItems = [];
    const updatedItemsWithCommonText = [];

    const subscription = await this.findOne(id);

    updateSubscriptionDto.name = capitalizeFirstLetterOfEachWordInAPhrase(updateSubscriptionDto.name);

    const checkIfNameExists = await this.checkIfNameExists(updateSubscriptionDto.name, id);

    if (!checkIfNameExists) {
      throw new NotAcceptableException(`A subscription with the name "${updateSubscriptionDto.name}" already exists.`);
    }

    const { attributes, items, ...payload } = updateSubscriptionDto;

    if (attributes?.length && subscription.attributes?.length) {
      for (const attribute of attributes) {
        const existingAttribute = subscription.attributes.find(a => a.name === attribute.name);

        if (existingAttribute) {
          if (existingAttribute.value !== attribute.value) {
            updatedAttributesWithCommonName.push({ id: existingAttribute.id, value: attribute.value });
          }
        } else {
          attribute.subscriptionId = subscription.id;
          updatedAttributes.push(attribute);
        }
      }
    }

    if (items?.length && subscription.items?.length) {
      for (const item of items) {
        const existingItem = subscription.items.find(i => i.text === item.text);

        if (existingItem) {
          if (existingItem.icon !== item.icon) {
            existingItem.icon = item.icon;
          }

          if (existingItem.tag !== item.tag) {
            existingItem.tag = item.tag;
          }

          updatedItemsWithCommonText.push(existingItem);
        } else {
          item.subscriptionId = subscription.id;
          updatedItems.push(item);
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({ where: { id }, data: payload });

      if (updatedAttributes.length) {
        await tx.subscriptionAttribute.createMany({ data: updatedAttributes });
      }

      if (updatedItems.length) {
        await tx.subscriptionItem.createMany({ data: updatedItems });
      }

      if (updatedAttributesWithCommonName.length) {
        await Promise.all(
          updatedAttributesWithCommonName.map(async (a) => {
            await tx.subscriptionAttribute.update({ where: { id: a.id }, data: { value: a.value } });
          }),
        );
      }

      if (updatedItemsWithCommonText.length) {
        await Promise.all(
          updatedItemsWithCommonText.map(async (i) => {
            await tx.subscriptionItem.update({ where: { id: i.id }, data: i });
          }),
        );
      }

      return updatedSubscription;
    });
  }

  async remove(id: number): Promise<SubscriptionEntity> {
    await this.findOne(id);
    return this.prisma.subscription.delete({ where: { id } });
  }

  async checkIfNameExists(name: string, id?: number): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({ where: { name }, });

    if (id) {
      return subscription ? subscription.id === id : true;
    }

    return !!subscription;
  }
}
