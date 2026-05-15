import type { V2TestimonialDTO } from "@workspace/types";
import type {
  MockTestimonial,
  ModerationStatus,
  TestimonialType,
} from "@/lib/mock-data";

/**
 * Map a V2 testimonial DTO into the MockTestimonial shape consumed by the
 * existing testimonial UI components. The only real difference is that
 * `createdAt` and `updatedAt` arrive as ISO strings over the wire.
 */
export function dtoToMockTestimonial(dto: V2TestimonialDTO): MockTestimonial {
  return {
    id: dto.id,
    projectId: dto.projectId,
    authorName: dto.authorName,
    authorEmail: dto.authorEmail,
    authorRole: dto.authorRole,
    authorCompany: dto.authorCompany,
    authorAvatar: dto.authorAvatar,
    content: dto.content,
    type: dto.type as TestimonialType,
    videoUrl: dto.videoUrl,
    mediaUrl: dto.mediaUrl,
    source: dto.source,
    sourceUrl: dto.sourceUrl,
    isPublished: dto.isPublished,
    rating: dto.rating,
    isApproved: dto.isApproved,
    isOAuthVerified: dto.isOAuthVerified,
    oauthProvider: dto.oauthProvider,
    moderationStatus: dto.moderationStatus as ModerationStatus,
    moderationScore: dto.moderationScore,
    moderationFlags: dto.moderationFlags,
    autoPublished: dto.autoPublished,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    tags: dto.tags,
  };
}
