import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service.js";
import { decodeSecretEncryptionKey } from "../../config/env.js";
import {
  decryptSecret,
  encryptSecret,
} from "../../common/crypto/secret-cipher.js";

@Injectable()
export class SigningSecretService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async generateOrRotate(projectId: string): Promise<{
    plaintext: string;
    rotatedAt: Date;
  }> {
    const key = this.getEncryptionKeyOrThrow();
    const plaintext = randomBytes(32).toString("base64");
    const rotatedAt = new Date();
    const signingSecretEncrypted = encryptSecret(plaintext, key);

    await this.prisma.client.project.update({
      where: { id: projectId },
      data: {
        signingSecretEncrypted,
        signingSecretRotatedAt: rotatedAt,
      },
    });

    return { plaintext, rotatedAt };
  }

  async clear(projectId: string): Promise<void> {
    await this.prisma.client.project.update({
      where: { id: projectId },
      data: {
        signingSecretEncrypted: null,
        signingSecretRotatedAt: null,
      },
    });
  }

  async getDecrypted(projectId: string): Promise<string | null> {
    const key = this.getEncryptionKeyOrThrow();
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
      select: { signingSecretEncrypted: true },
    });

    if (!project?.signingSecretEncrypted) {
      return null;
    }

    return decryptSecret(project.signingSecretEncrypted, key);
  }

  private getEncryptionKeyOrThrow(): Buffer {
    const key = decodeSecretEncryptionKey(
      this.configService.get<string>("API_V2_SECRET_ENCRYPTION_KEY"),
    );

    if (!key) {
      throw new InternalServerErrorException(
        "Signing-secret service requires API_V2_SECRET_ENCRYPTION_KEY",
      );
    }

    return key;
  }
}
