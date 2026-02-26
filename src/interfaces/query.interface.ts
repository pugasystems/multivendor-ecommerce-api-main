export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

export interface CommonQuery {
    skip?: number;
    take?: number;
    orderBy?: string;
    sortOrder?: SortOrder;
    search?: string;
}

export interface StateQuery extends CommonQuery {
    countryId?: number;
}

export interface CityQuery extends CommonQuery {
    stateId?: number;
}

export interface ShippingAddressQuery extends CommonQuery {
    userId?: number;
    countryId?: number;
    stateId?: number;
    districtId?: number;
    cityId?: number;
}

export interface VendorQuery extends CommonQuery {
    userId?: number;
    userAddressId?: number;
    businessCategoryId?: number;
}

export interface CategoryQuery extends CommonQuery {
    businessCategoryId?: number;
    parentCategoryId?: number;
}

export interface ProductQuery extends CommonQuery {
    categoryId?: number;
    vendorId?: number;
    countryId?: number;
    stateId?: number;
    districtId?: number;
    cityId?: number;
}

export interface LeadsQuery extends CommonQuery {
    vendorId: number;
    businessCategoryId: number;
}

export interface ChatQuery extends CommonQuery {
    userIdOne: number;
    userIdTwo: number;
}

export interface ChatHistoryQuery {
    skip?: number;
    take?: number;
    vendorId?: number;
}