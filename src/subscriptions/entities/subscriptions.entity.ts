import { ApiProperty } from "@nestjs/swagger";
import { SubscriptionEntity } from "./subscription.entity";

export class Subscriptions {
    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    subscriptions: SubscriptionEntity[];
}