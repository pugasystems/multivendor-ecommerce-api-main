import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CanEdit implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const payload = request.payload;
    const id = +request.params.id;

    if (payload.role.name === "Admin") {
      return true;
    }

    if (payload.vendors?.length) {
      const product = await this.prismaService.product.findFirst({ where: { id } });

      if (product) {
        return payload.vendors.find(
          (v: { id: number, name: string }) => v.id === product.vendorId,
        );
      }
    }

    return false;
  }
}
