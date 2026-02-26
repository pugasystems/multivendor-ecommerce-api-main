import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CanCreate implements CanActivate {
  canActivate(
      context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();

    const payload = request.payload;
    const vendorId = +request.body.vendorId;

    if (payload.role.name === "Admin") {
      return true;
    }

    if (payload.vendors?.length && vendorId) {
      return payload.vendors.find((v: { id: number }) => v.id === vendorId);
    }

    return false;
  }
}
