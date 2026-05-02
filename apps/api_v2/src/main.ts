import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { ZodValidationPipe } from "./common/zod/zod-validation.pipe.js";
import { PrismaService } from "./modules/prisma/prisma.service.js";
import {
  PUBLIC_API_V2_CORS_ALLOWED_HEADERS,
  buildApiV2CorsOptions,
  extractPublicProjectSlugFromPath,
  isDefaultHostedPublicOrigin,
  normalizeOrigin,
} from "./config/security.js";

const PUBLIC_CORS_CACHE_TTL_MS = 60_000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false,
    rawBody: true,
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix("v2", { exclude: ["health"] });

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const publicOriginCache = new Map<
    string,
    { allowed: boolean; expiresAt: number }
  >();

  app.use(createPublicProjectCorsMiddleware(prismaService, publicOriginCache));
  app.enableCors(
    buildApiV2CorsOptions(configService.get<string>("API_V2_CORS_ORIGINS")),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ZodValidationPipe());

  const port = configService.get<number>("API_V2_PORT") ?? 8100;

  await app.listen(port);

  Logger.log(`api_v2 listening on http://localhost:${port}`, "Bootstrap");
}

void bootstrap();

function createPublicProjectCorsMiddleware(
  prismaService: PrismaService,
  cache: Map<string, { allowed: boolean; expiresAt: number }>,
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const slug = extractPublicProjectSlugFromPath(request.path);
    const origin = request.headers.origin;

    if (!slug || !origin) {
      next();
      return;
    }

    const allowed = await isPublicProjectOriginAllowed(
      prismaService,
      cache,
      slug,
      origin,
    );
    if (!allowed) {
      next();
      return;
    }

    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader(
      "Access-Control-Allow-Headers",
      PUBLIC_API_V2_CORS_ALLOWED_HEADERS.join(","),
    );
    response.setHeader(
      "Access-Control-Max-Age",
      String(Math.floor(PUBLIC_CORS_CACHE_TTL_MS / 1000)),
    );

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  };
}

async function isPublicProjectOriginAllowed(
  prismaService: PrismaService,
  cache: Map<string, { allowed: boolean; expiresAt: number }>,
  slug: string,
  origin: string,
) {
  const normalizedOrigin = normalizeOrigin(origin);
  const cacheKey = `${slug}\0${normalizedOrigin}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.allowed;
  }

  const allowed = await resolvePublicProjectOrigin(
    prismaService,
    slug,
    normalizedOrigin,
  );
  cache.set(cacheKey, {
    allowed,
    expiresAt: now + PUBLIC_CORS_CACHE_TTL_MS,
  });
  return allowed;
}

async function resolvePublicProjectOrigin(
  prismaService: PrismaService,
  slug: string,
  origin: string,
) {
  if (isDefaultHostedPublicOrigin(origin, slug)) {
    return true;
  }

  const project = await prismaService.client.project.findUnique({
    where: { slug },
    select: { id: true, allowedOrigins: true },
  });
  if (!project) {
    return false;
  }

  if (project.allowedOrigins.includes(origin)) {
    return true;
  }

  const trustedOrigin =
    await prismaService.client.projectTrustedOrigin.findFirst({
      where: {
        projectId: project.id,
        origin,
        status: "ACTIVE",
      },
      select: { id: true },
    });

  return Boolean(trustedOrigin);
}
