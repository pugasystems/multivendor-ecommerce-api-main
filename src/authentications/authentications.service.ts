import { ForbiddenException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcrypt';
import { JwtPayload } from 'src/interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginEntity } from './entities/login.entity';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { RegisterEntity } from './entities/register.entity';
import { VerifyEmailDto } from './dto/verify-emaial.dto';
import { User, VerificationType } from '@prisma/client';
import { VerifyEmailEntity } from './entities/verify-email.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { ResendOtpDto } from './dto/resent-otp-dto';

@Injectable()
export class AuthenticationsService {
    constructor(
        @InjectQueue("users") private readonly userQueue: Queue,
        private readonly prisma: PrismaService,
        private jwtService: JwtService,
        private userService: UsersService,
    ) {}

    async login(loginDto: LoginDto): Promise<LoginEntity> {
        const user = await this.fetchUserFromUsername(
            loginDto.username, true, true,
        ) as any;

        const comparePassword = await compare(loginDto.password, user.password);

        if (!comparePassword) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const payload: JwtPayload = {
            ...(user.vendors.length && { vendors: user.vendors }),
            userId: user.id,
            role: user.role,
            isActive: user.isActive,
            hasVerified: user.hasVerified,
        };

        const accessToken: string = await this.jwtService.signAsync(payload);

        return { ...payload, accessToken };
    }

    async register(registerDto: RegisterDto): Promise<RegisterEntity> {
        const user = await this.userService.create(registerDto);

        return {
            ...user,
            message: 'An OTP has been sent to your verification mail',
        };
    }

    async verifyEmailAddress(verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailEntity> {
        const payload = { ...verifyEmailDto, type: VerificationType.registration };

        await this.userService.verify(payload);

        return {
            message: 'Congratulations! You have verified your email',
            statusCode: HttpStatus.OK,
        };
    }

    async verifyEmailAddressChange(verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailEntity> {
        const payload = { ...verifyEmailDto, type: VerificationType.verifyEmailChange };

        await this.userService.verify(payload);

        return {
            message: 'Congratulations! You have verified your email',
            statusCode: HttpStatus.OK,
        };
    }

    async sendVerificationOtp(
        forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{userId: number, message: string}> {
        const user = await this.fetchUserFromUsername(
            forgotPasswordDto.username, false, false,
        );

        const verificationCode = await this.userService.generateVerificationCode();

        await this.prisma.verificationCode.create({
            data: {
                verificationCode,
                userId: user.id,
                type: VerificationType.forgotPassword,
            },
        });

        await this.userQueue.add("resetPassword", {
            from: process.env.MAIL_ACCOUNT_CONTACTS,
            to: user.email,
            otp: verificationCode,
        });

        return {
            userId: user.id,
            message: "An OTP has been sent to your email address"
        }
    }

    async verifyForgotPasswordOTP(verifyEmailDto: VerifyEmailDto): Promise<{userId: number}> {
        const verificationCode = await this.prisma.verificationCode.findFirst({
            where: {
                verificationCode: verifyEmailDto.verificationCode,
                userId: verifyEmailDto.userId,
                type: VerificationType.forgotPassword,
            }
        });

        if (!verificationCode) {
            throw new NotFoundException('Invalid OTP.');
        }

        await this.prisma.verificationCode.delete({ where: { id: verificationCode.id } });

        return {
            userId: verificationCode.userId,
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const user = await this.userService.findOne(+resetPasswordDto.userId);

        const password = await hash(resetPasswordDto.password, parseInt(process.env.SALT_ROUNDS));

        await this.prisma.user.update({ where: { id: user.id }, data: { password } });

        return {
            message: "Password changed successfully"
        };
    }

    async profile(userId: number): Promise<UserEntity> {
        return this.userService.findOne(userId);
    }

    async resendOtp(resendOtpDto: ResendOtpDto) {
        const user = await this.userService.findOne(+resendOtpDto.userId);

        const [_, verificationCode] = await Promise.all([
            this.prisma.verificationCode
                .deleteMany({ where: { userId: +resendOtpDto.userId } }),
            this.userService.generateVerificationCode(),
        ]);

        await this.prisma.verificationCode.create({
            data: {
                verificationCode,
                userId: +resendOtpDto.userId,
                type: resendOtpDto.type,
            },
        });

        await this.userQueue.add("verifyEmailAddress", {
            from: process.env.MAIL_ACCOUNT_CONTACTS,
            to: user.email,
            otp: verificationCode,
        });

        return {
            message: "An OTP has been sent to your verification mail",
        }
    }

    private async fetchUserFromUsername(
        username: string,
        includeRelationship: boolean,
        throwActivityErrors: boolean,
    ): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: username },
                    { mobileNumber: username },
                ],
            },
            ...(includeRelationship && {
                include: {
                    role: true,
                    vendors: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                },
            }),
        });

        if (!user) {
            throw new NotFoundException('User does not exist');
        }

        if (!user.hasVerified && throwActivityErrors) {
            throw new ForbiddenException('You have not verified your account');
        }

        if (!user.isActive && throwActivityErrors) {
            throw new ForbiddenException('Your account is no longer active. Please contact support for further assistance');
        }

        return user;
    }
}
