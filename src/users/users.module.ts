import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesService } from 'src/roles/roles.service';
import { BullModule } from '@nestjs/bull';
import { UsersProcessor } from './users.processor';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesService, UsersProcessor],
  imports: [
    BullModule.registerQueue({
      name: "users",
    }),
    PrismaModule,
  ],
})
export class UsersModule {}
