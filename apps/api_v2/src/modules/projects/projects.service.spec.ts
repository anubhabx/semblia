import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ProjectsService } from "./projects.service.js";
import type { PrismaService } from "../prisma/prisma.service.js";

const mockProjectFindUnique = vi.fn();
const mockProjectUpdate = vi.fn();

const prismaMock = {
  client: {
    project: {
      findUnique: mockProjectFindUnique,
      update: mockProjectUpdate,
    },
  },
} as unknown as PrismaService;

describe("ProjectsService allowed origins", () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService(prismaMock);
    vi.clearAllMocks();
  });

  it("lists allowed origins for an existing project", async () => {
    mockProjectFindUnique.mockResolvedValue({
      allowedOrigins: ["https://example.com"],
    });

    await expect(service.listAllowedOrigins("project_1")).resolves.toEqual([
      "https://example.com",
    ]);
  });

  it("throws when listing allowed origins for a missing project", async () => {
    mockProjectFindUnique.mockResolvedValue(null);

    await expect(service.listAllowedOrigins("project_1")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("dedupes by case-insensitive host and sorts lexicographically", async () => {
    mockProjectUpdate.mockResolvedValue({
      allowedOrigins: ["https://alpha.example.com", "https://beta.example.com"],
    });

    const result = await service.replaceAllowedOrigins("project_1", [
      "https://beta.example.com",
      "https://ALPHA.example.com",
      "https://alpha.example.com",
    ]);

    expect(mockProjectUpdate).toHaveBeenCalledWith({
      where: { id: "project_1" },
      data: {
        allowedOrigins: [
          "https://alpha.example.com",
          "https://beta.example.com",
        ],
      },
      select: { allowedOrigins: true },
    });
    expect(result).toEqual([
      "https://alpha.example.com",
      "https://beta.example.com",
    ]);
  });
});
