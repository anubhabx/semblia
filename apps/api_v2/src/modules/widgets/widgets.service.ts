import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  CreateWidgetBodyDto,
  ProjectWidgetsParamsDto,
  UpdateWidgetBodyDto,
  WallSlugParamsDto,
  WidgetIdParamsDto,
} from "./widgets.dto.js";

@Injectable()
export class WidgetsService {
  list(_userId: string, _params: ProjectWidgetsParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("widgets.list not implemented");
  }

  create(_userId: string, _body: CreateWidgetBodyDto) {
    void _userId;
    void _body;
    throw new NotImplementedException("widgets.create not implemented");
  }

  update(
    _userId: string,
    _params: WidgetIdParamsDto,
    _body: UpdateWidgetBodyDto,
  ) {
    void _userId;
    void _params;
    void _body;
    throw new NotImplementedException("widgets.update not implemented");
  }

  delete(_userId: string, _params: WidgetIdParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("widgets.delete not implemented");
  }

  getPublic(_params: WidgetIdParamsDto) {
    void _params;
    throw new NotImplementedException("widgets.getPublic not implemented");
  }

  getPublicWall(_params: WallSlugParamsDto) {
    void _params;
    throw new NotImplementedException("widgets.getPublicWall not implemented");
  }

  renderEmbed(_params: WidgetIdParamsDto) {
    void _params;
    throw new NotImplementedException("widgets.renderEmbed not implemented");
  }
}
