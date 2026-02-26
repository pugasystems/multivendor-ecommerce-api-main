import { Module } from '@nestjs/common';
import { AuthenticationsService } from './authentications.service';
import { AuthenticationsController } from './authentications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { BullModule } from '@nestjs/bull';

@Module({
  controllers: [AuthenticationsController],
  providers: [AuthenticationsService, UsersService, RolesService],
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    BullModule.registerQueue({
      name: "users",
    }),
  ],
})
export class AuthenticationsModule {}
