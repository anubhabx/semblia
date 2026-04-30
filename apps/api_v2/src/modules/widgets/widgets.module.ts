import { Module } from "@nestjs/common";
import { AuthzModule } from "../../common/authz/authz.module.js";
import { RedisModule } from "../redis/redis.module.js";
import {
  PublicWallsController,
  PublicWidgetEmbedsController,
  WidgetsController,
} from "./widgets.controller.js";
import { WidgetsService } from "./widgets.service.js";

@Module({
  imports: [AuthzModule, RedisModule],
  controllers: [
    WidgetsController,
    PublicWidgetEmbedsController,
    PublicWallsController,
  ],
  providers: [WidgetsService],
})
export class WidgetsModule {}
