import { Module } from "@nestjs/common";
import { ProjectAccessService } from "../../common/authz/project-access.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { MediaController } from "./media.controller.js";
import { MediaService } from "./media.service.js";
import { S3Service } from "./s3.service.js";
import { StorageService } from "./storage.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [S3Service, StorageService, MediaService, ProjectAccessService],
  exports: [MediaService, S3Service, StorageService],
})
export class StorageModule {}
