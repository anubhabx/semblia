import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  CreateFormBodyDto,
  FormIdParamsDto,
  ProjectFormsParamsDto,
  PublicFormSubmissionBodyDto,
  UpdateFormBodyDto,
} from "./forms.dto.js";

@Injectable()
export class FormsService {
  list(_userId: string, _params: ProjectFormsParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("forms.list not implemented");
  }

  create(_userId: string, _body: CreateFormBodyDto) {
    void _userId;
    void _body;
    throw new NotImplementedException("forms.create not implemented");
  }

  getById(_userId: string, _params: FormIdParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("forms.getById not implemented");
  }

  update(_userId: string, _params: FormIdParamsDto, _body: UpdateFormBodyDto) {
    void _userId;
    void _params;
    void _body;
    throw new NotImplementedException("forms.update not implemented");
  }

  delete(_userId: string, _params: FormIdParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("forms.delete not implemented");
  }

  submitPublic(_params: FormIdParamsDto, _body: PublicFormSubmissionBodyDto) {
    void _params;
    void _body;
    throw new NotImplementedException("forms.submitPublic not implemented");
  }
}
