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

    const userAddress = await this.prismaService.userAddress.findFirst({
        where: {
            id,
            userId: +request.payload.userId,
        },
    });

    if (!userAddress) {
        return false;
    }

    return true;
  }
}
