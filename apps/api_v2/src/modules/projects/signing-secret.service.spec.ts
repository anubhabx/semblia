import { beforeEach, describe, expect, it, vi } from "vitest";
import { InternalServerErrorException } from "@nestjs/common";
import { SigningSecretService } from "./signing-secret.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import type { ConfigService } from "@nestjs/config";

const mockProjectUpdate = vi.fn();
const mockProjectFindUnique = vi.fn();
const mockConfigGet = vi.fn();

const prismaMock = {
  client: {
    project: {
      update: mockProjectUpdate,
      findUnique: mockProjectFindUnique,
    },
  },
} as unknown as PrismaService;

const configServiceMock = {
  get: mockConfigGet,
} as unknown as ConfigService;

const base64Key = Buffer.alloc(32, 9).toString("base64");

describe("SigningSecretService", () => {
  let service: SigningSecretService;

  beforeEach(() => {
    service = new SigningSecretService(prismaMock, configServiceMock);
    vi.clearAllMocks();
    mockConfigGet.mockReturnValue(base64Key);
  });

  it("generates and persists an encrypted signing secret", async () => {
    await service.generateOrRotate("project_1");

    expect(mockProjectUpdate).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: expect.objectContaining({
        signingSecretEncrypted: expect.any(String),
        signingSecretRotatedAt: expect.any(Date),
      }),
    });

    const result = await service.generateOrRotate("project_1");
    expect(result.plaintext).toEqual(expect.any(String));
    expect(result.rotatedAt).toEqual(expect.any(Date));
  });

  it("roundtrips the encrypted blob through getDecrypted", async () => {
    mockProjectUpdate.mockResolvedValue(undefined);

    const generated = await service.generateOrRotate("project_1");
    expect(mockProjectUpdate.mock.calls[0]).toBeDefined();
    const encrypted =
      mockProjectUpdate.mock.calls[0]![0].data.signingSecretEncrypted;
    mockProjectFindUnique.mockResolvedValue({
      signingSecretEncrypted: encrypted,
    });

    await expect(service.getDecrypted("project_1")).resolves.toBe(
      generated.plaintext,
    );
  });

  it("rotates by replacing the stored encrypted blob", async () => {
    await service.generateOrRotate("project_1");
    expect(mockProjectUpdate.mock.calls[0]).toBeDefined();
    const firstEncrypted =
      mockProjectUpdate.mock.calls[0]![0].data.signingSecretEncrypted;

    await service.generateOrRotate("project_1");
    expect(mockProjectUpdate.mock.calls[1]).toBeDefined();
    const secondEncrypted =
      mockProjectUpdate.mock.calls[1]![0].data.signingSecretEncrypted;

    expect(secondEncrypted).not.toBe(firstEncrypted);
  });

  it("clears both signing secret columns", async () => {
    await service.clear("project_1");

    expect(mockProjectUpdate).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: {
        signingSecretEncrypted: null,
        signingSecretRotatedAt: null,
      },
    });
  });

  it("throws when the env key is missing", async () => {
    mockConfigGet.mockReturnValue(undefined);

    await expect(service.generateOrRotate("project_1")).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
