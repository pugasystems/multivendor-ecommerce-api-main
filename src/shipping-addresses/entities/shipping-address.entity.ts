import { ApiProperty } from "@nestjs/swagger";
import { UserAddress } from "@prisma/client";
import { CityEntity } from "src/cities/entities/city.entity";
import { CountryEntity } from "src/countries/entities/country.entity";
import { DistrictEntity } from "src/districts/entities/district.entity";
import { StateEntity } from "src/states/entities/state.entity";
import { UserEntity } from "src/users/entities/user.entity";

export class ShippingAddressEntity implements UserAddress {
    @ApiProperty()
    id: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    countryId: number;

    @ApiProperty()
    stateId: number;

    @ApiProperty()
    districtId: number;

    @ApiProperty()
    cityId: number;

    @ApiProperty()
    addressLineOne: string;

    @ApiProperty({ nullable: true })
    addressLineTwo: string;

    @ApiProperty({ nullable: true })
    zipCode: string;

    @ApiProperty()
    isDefault: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    user: UserEntity;

    @ApiProperty()
    country: CountryEntity;

    @ApiProperty()
    state: StateEntity;

    @ApiProperty()
    district: DistrictEntity;

    @ApiProperty()
    city: CityEntity;
}
