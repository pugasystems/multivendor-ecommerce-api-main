import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_VENDOR_KEY = 'isVendor';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Vendor = () => SetMetadata(IS_VENDOR_KEY, true);