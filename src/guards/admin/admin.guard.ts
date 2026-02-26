import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { extractToken } from 'src/helpers/extractToken';
import { IS_PUBLIC_KEY, IS_VENDOR_KEY } from 'src/helpers/public';
import { JwtPayload } from 'src/interfaces/jwt.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const token = extractToken(request);

      if (!token) {
        throw new UnauthorizedException();
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(
        token, { secret: process.env.JWT_SECRET_KEY },
      );

      request['payload'] = payload;

      const isVendor = this.reflector.getAllAndOverride<boolean>(IS_VENDOR_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isVendor && payload.role.name === "Vendor") {
        return true;
      }

      if (payload.role.name !== "Admin") {
        throw new ForbiddenException();
      }
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
