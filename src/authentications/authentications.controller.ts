import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticationsService } from './authentications.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginEntity } from './entities/login.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterEntity } from './entities/register.entity';
import { VerifyEmailEntity } from './entities/verify-email.entity';
import { VerifyEmailDto } from './dto/verify-emaial.dto';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resent-otp-dto';

@ApiBearerAuth()
@ApiTags( 'Authentications' )
@Controller('auth')
export class AuthenticationsController {
  constructor(private readonly authenticationsService: AuthenticationsService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: "Login", type: LoginEntity })
  @ApiNotFoundResponse({ description: "User does not exist" })
  @ApiUnauthorizedResponse({ description: "Invalid Credentials" })
  @ApiInternalServerErrorResponse()
  login(@Body() loginDto: LoginDto) {
    return this.authenticationsService.login(loginDto);
  }

  @Post('register')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Register', type: RegisterEntity })
  @ApiNotFoundResponse({ description: 'Unable to find...' })
  @ApiNotAcceptableResponse({ description: 'Conflict with existing data' })
  @ApiInternalServerErrorResponse()
  register(@Body() registerDto: RegisterDto) {
    return this.authenticationsService.register(registerDto);
  }

  @Post('forgot/password')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authenticationsService.sendVerificationOtp(forgotPasswordDto);
  }

  @Post('forgot/password/verify')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  forgotPasswordVerify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authenticationsService.verifyForgotPasswordOTP(verifyEmailDto);
  }

  @Post('email/verify')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Email Verified', type: VerifyEmailEntity })
  @ApiNotFoundResponse({ description: "Invalid Otp" })
  @ApiInternalServerErrorResponse()
  verifyEmail(@Body() VerifyEmailDto: VerifyEmailDto) {
    return this.authenticationsService.verifyEmailAddress(VerifyEmailDto);
  }

  @UseGuards(AuthGuard)
  @Post('email/change/verify')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Email Verified', type: VerifyEmailEntity })
  @ApiNotFoundResponse({ description: "Invalid Otp" })
  @ApiInternalServerErrorResponse()
  verifyEmailChange(@Body() VerifyEmailDto: VerifyEmailDto) {
    return this.authenticationsService.verifyEmailAddressChange(VerifyEmailDto);
  }

  @Post('reset/password')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authenticationsService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  profile(@Request() req: any) {
    return this.authenticationsService.profile(+req.payload.userId);
  }

  @Post('otp/resend')
  @HttpCode(200)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authenticationsService.resendOtp(resendOtpDto);
  }
}
