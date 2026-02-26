import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { base64Tester } from 'src/helpers/base64Tester';

@Injectable()
export class UploadService {
    private readonly s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
            },
        });
    }

    async uploadImage(image: string, keyName: string, folderName: string): Promise<string> {
        try {
            if (!base64Tester(image)) {
                throw new BadRequestException("The provided base64 encoded string is not valid");
            }

            const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const contentType = image.match(/data:image\/(\w+);/)[1];

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${folderName}/${keyName}.${contentType}`,
                Body: buffer,
                ContentType: contentType
            }
            await this.s3.send(new PutObjectCommand(params));
            return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${params.Bucket}/${params.Key}`;
        } catch (error) {
            throw new Error(`Error uploading image: ${error.message}`);
        }
    }

    async deleteImage(imageUrl: string): Promise<void> {
        try {
            const splittedUrl: string[] = imageUrl.split("/");
            const folderName: string = splittedUrl[splittedUrl.length - 2];
            const keyName: string = splittedUrl[splittedUrl.length - 1];
            const key: string = `${folderName}/${keyName}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            }

            await this.s3.send(new DeleteObjectCommand(params));
        } catch (error) {
            throw new Error(`Error uploading image: ${error.message}`);
        }
    }
}
