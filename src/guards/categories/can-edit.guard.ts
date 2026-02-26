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

    const categoriesOnVendors = await this.prismaService.categoriesOnVendors.findMany({
      where: { categoryId: id },
      select: {
        vendorId: true,
      }
    });

    if (payload.vendors?.length) {
      for (const vendor of payload.vendors) {
        const isOwner = categoriesOnVendors.find(c => c.vendorId === vendor.id);
        if (isOwner) {
          return true;
        }
      }
    }

    return false;
  }
}
