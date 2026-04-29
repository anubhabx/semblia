import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  CreatePublicTestimonialBodyDto,
  ModerationActionParamsDto,
  PublicProjectSlugParamsDto,
  PublishTestimonialBodyDto,
  TestimonialDetailParamsDto,
  TestimonialDetailQueryDto,
  TestimonialsListQueryDto,
} from "./testimonials.dto.js";

@Injectable()
export class TestimonialsService {
  list(_userId: string, _query: TestimonialsListQueryDto) {
    void _userId;
    void _query;
    throw new NotImplementedException("testimonials.list not implemented");
  }

  getById(
    _userId: string,
    _params: TestimonialDetailParamsDto,
    _query: TestimonialDetailQueryDto,
  ) {
    void _userId;
    void _params;
    void _query;
    throw new NotImplementedException("testimonials.getById not implemented");
  }

  approve(_userId: string, _params: ModerationActionParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("testimonials.approve not implemented");
  }

  reject(_userId: string, _params: ModerationActionParamsDto) {
    void _userId;
    void _params;
    throw new NotImplementedException("testimonials.reject not implemented");
  }

  publish(
    _userId: string,
    _params: ModerationActionParamsDto,
    _body: PublishTestimonialBodyDto,
  ) {
    void _userId;
    void _params;
    void _body;
    throw new NotImplementedException("testimonials.publish not implemented");
  }

  createPublic(
    _params: PublicProjectSlugParamsDto,
    _body: CreatePublicTestimonialBodyDto,
  ) {
    void _params;
    void _body;
    throw new NotImplementedException(
      "testimonials.createPublic not implemented",
    );
  }

  listPublic(_params: PublicProjectSlugParamsDto) {
    void _params;
    throw new NotImplementedException(
      "testimonials.listPublic not implemented",
    );
  }
}
