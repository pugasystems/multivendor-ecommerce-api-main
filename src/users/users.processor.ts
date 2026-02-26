import { MailerService } from "@nestjs-modules/mailer";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Mail } from "src/interfaces/queue.interface";

@Processor('users')
export class UsersProcessor {
    constructor(private readonly mail: MailerService) {}

    @Process("verifyEmailAddress")
    async sendVerificationMail(job: Job<Mail>) {
        const { data } = job;

        try {
            await this.mail.sendMail({
                ...data,
                subject: "Verify Your Email",
                template: "verify-email",
                context: {
                    otp: data.otp,
                },
            });
        } catch (e) {
            console.log(e);
        }
    }

    @Process("resetPassword")
    async sendResetPasswordMail(job: Job<Mail>) {
        const { data } = job;

        try {
            await this.mail.sendMail({
                ...data,
                subject: "Reset Password",
                template: "reset-password",
                context: {
                    otp: data.otp,
                },
            });
        } catch (e) {
            console.log(e);
        }
    }
}