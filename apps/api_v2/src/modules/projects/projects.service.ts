import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  CreateProjectBodyDto,
  ListProjectsQueryDto,
  ProjectSlugParamsDto,
  UpdateProjectBodyDto,
} from "./projects.dto.js";

@Injectable()
export class ProjectsService {
  list(_userId: string, _query: ListProjectsQueryDto) {
    void _userId;
    void _query;
    throw new NotImplementedException("projects.list not implemented");
  }

  create(_userId: string, _body: CreateProjectBodyDto) {
    void _userId;
    void _body;
    throw new NotImplementedException("projects.create not implemented");
  }

  getBySlug(_userId: string, _params: ProjectSlugParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("projects.getBySlug not implemented");
  }

  update(
    _userId: string,
    _params: ProjectSlugParamsDto,
    _body: UpdateProjectBodyDto,
  ) {
    void _userId;
    void _params;
    void _body;
    throw new NotImplementedException("projects.update not implemented");
  }

  delete(_userId: string, _params: ProjectSlugParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("projects.delete not implemented");
  }
}
