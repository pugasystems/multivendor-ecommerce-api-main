import { ApiProperty } from "@nestjs/swagger";
import { Subscription, SubscriptionAttribute, SubscriptionItem } from "@prisma/client";

export class SubscriptionEntity implements Subscription {
    @ApiProperty()
    id: number;

    @ApiProperty({ uniqueItems: true, })
    name: string;

    @ApiProperty({ default: 0 })
    price: number;

    @ApiProperty()
    description: string;

    @ApiProperty()
    leadsCount: number;

    @ApiProperty({ required: false, nullable: true, })
    createdAt: Date;

    @ApiProperty({ required: false, nullable: true })
    updatedAt: Date;

    @ApiProperty({ required: false, nullable: true })
    attributes?: SubscriptionAttribute[];

    @ApiProperty({ required: false, nullable: true })
    items?: SubscriptionItem[];
}
