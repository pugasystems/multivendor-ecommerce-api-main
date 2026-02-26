import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeFirstLetterOfEachWordInAPhrase, capitalizeFirtLeterOfAWord } from 'src/helpers/capitalize';
import { hash } from 'bcrypt';
import { RolesService } from 'src/roles/roles.service';
import { VerificationType } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserEntity } from './entities/user.entity';
import { VerifyDto } from './dto/verify.dto';
import { CommonQuery } from 'src/interfaces/query.interface';
import { Users } from './entities/users.entity';
import { RegisterEntity } from 'src/authentications/entities/register.entity';

@Injectable()
export class UsersService {
  constructor (
    @InjectQueue("users") private readonly userQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const uniqueRole = await this.roleService.findRoleByName(capitalizeFirstLetterOfEachWordInAPhrase(createUserDto.roleName));

    createUserDto.roleId = uniqueRole.id;

    delete createUserDto.roleName;

    if (createUserDto.email) {
      const checkIfEmailIsTaken = await this.checkIfEmailIsTaken(createUserDto.email);

      if (checkIfEmailIsTaken) {
        throw new NotAcceptableException(`The email ${createUserDto.email} has already been taken.`);
      }
    }

    const checkIfMobileNumberIsTaken = await this.checkIfMobileNumberIsTaken(createUserDto.mobileNumber);

    if (checkIfMobileNumberIsTaken) {
      throw new NotAcceptableException(`The mobile number ${createUserDto.mobileNumber} has already been taken.`);
    }

    createUserDto.firstName = capitalizeFirtLeterOfAWord(createUserDto.firstName);

    if (createUserDto.middleName) {
      createUserDto.middleName = capitalizeFirtLeterOfAWord(createUserDto.middleName);
    }

    createUserDto.lastName = capitalizeFirtLeterOfAWord(createUserDto.lastName);
    createUserDto.password = await hash(createUserDto.password, parseInt(process.env.SALT_ROUNDS));

    const verificationCode = await this.generateVerificationCode();

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({ data: createUserDto, include: { role: true } });
      await tx.verificationCode.create({
        data: {
          verificationCode,
          userId: createdUser.id,
          type: VerificationType.registration,
        }
      });

      return createdUser;
    });

    await this.userQueue.add("verifyEmailAddress", {
      from: process.env.MAIL_ACCOUNT_CONTACTS,
      to: user.email,
      otp: verificationCode,
    });

    const { password, roleId, ...rest } = user;

    return rest;
  }

  async findAll(query: CommonQuery): Promise<Users> {
    const whereClause: { AND?: object[] } = {};

    if (query.search) {
      whereClause.AND = [
        {
          OR: [
            {
              firstName: {
                contains: query.search,
              },
            },
            {
              middleName: {
                contains: query.search,
              },
            },
            {
              lastName: {
                contains: query.search,
              },
            },
            {
              email: {
                contains: query.search,
              },
            },
            {
              mobileNumber: {
                contains: query.search,
              }
            }
          ],
        },
      ];
    }

    const [totalCount, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        skip: query.skip,
        take: query.take,
        orderBy: {
          [query.orderBy]: query.sortOrder,
        },
        include: { role: true },
      }),
    ]);

    return { totalCount, users };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findFirst({ where: { id }, include: { role: true, vendors: true, } });

    if (!user) {
      throw new NotFoundException(`Unable to find the user with id ${id}`);
    }

    const { password, ...rest } = user;

    return rest;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<RegisterEntity> {
    let userResponse: RegisterEntity;

    const [user, _] = await Promise.all([
      this.findOne(id),
      this.roleService.findOne(updateUserDto.roleId),
    ]);

    if (updateUserDto.email) {
      const checkIfEmailIsTaken = await this.checkIfEmailIsTaken(updateUserDto.email, id);

      if (!checkIfEmailIsTaken) {
        throw new NotAcceptableException(`The email ${updateUserDto.email} has already been taken.`);
      }
    }

    const checkIfMobileNumberIsTaken = await this.checkIfMobileNumberIsTaken(updateUserDto.mobileNumber, id);

    if (!checkIfMobileNumberIsTaken) {
      throw new NotAcceptableException(`The mobile number ${updateUserDto.mobileNumber} has already been taken.`);
    }

    updateUserDto.firstName = capitalizeFirtLeterOfAWord(updateUserDto.firstName);

    if (updateUserDto.middleName) {
      updateUserDto.middleName = capitalizeFirtLeterOfAWord(updateUserDto.middleName);
    }

    updateUserDto.lastName = capitalizeFirtLeterOfAWord(updateUserDto.lastName);
    updateUserDto.password && delete updateUserDto.password;

    userResponse = user;

    if (user.email !== updateUserDto.email) {
      const verificationCode = await this.generateVerificationCode();

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id }, data: { ...updateUserDto, verifiedAt: null}});
        await tx.verificationCode.create({
          data: {
            verificationCode,
            userId: user.id,
            type: VerificationType.verifyEmailChange,
          },
        });
      });

      await this.userQueue.add("verifyEmailAddress", {
        from: process.env.MAIL_ACCOUNT_CONTACTS,
        to: updateUserDto.email,
        otp: verificationCode,
      });

      userResponse.message = 'An OTP has been sent to your new email address';

      return userResponse;
    }

    await this.prisma.user.update({ where: { id }, data: updateUserDto });

    return userResponse;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id }});
  }

  async verify(verifyDto: VerifyDto): Promise<void> {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        userId: verifyDto.userId,
        verificationCode: verifyDto.verificationCode,
        type: verifyDto.type,
      }
    });

    if (!verificationCode) {
      throw new NotFoundException("Invalid Otp.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: verifyDto.userId,
        },
        data: {
          verifiedAt: new Date(),
          hasVerified: true,
          isActive: true,
        },
      }),
      this.prisma.verificationCode.delete({ where: { id: verificationCode.id } }),
    ]);
  }

  async checkIfEmailIsTaken(email: string, id?: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (id) {
      return user ? user.id === id : true;
    }

    return !!user;
  }

  async checkIfMobileNumberIsTaken(mobileNumber: string, id?: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { mobileNumber } });

    if (id) {
      return user ? user.id === id : true;
    }

    return !!user;
  }

  async generateVerificationCode() {
    let verificationCode: number;

    do {
      verificationCode = Math.floor(100000 + Math.random() * 900000);

      const checkIfCodeHasBeenGenerated = await this.prisma.verificationCode.findFirst({
        where: { verificationCode },
      });

      if (!checkIfCodeHasBeenGenerated) {
        return verificationCode;
      }
    } while(true);
  }
}
