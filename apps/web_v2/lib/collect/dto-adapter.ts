import type { V2FormConfigEntry } from "@workspace/types";
import type { FormConfigEntry } from "@/lib/collect/studio-types";

export function dtoToFormConfigEntry(dto: V2FormConfigEntry): FormConfigEntry {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    isActive: dto.isActive,
    abWeight: dto.abWeight,
    createdAt: Date.parse(dto.createdAt),
    updatedAt: Date.parse(dto.updatedAt),
    submissions: dto.submissions,
    views: dto.views,
    responseRate: dto.responseRate,
    avgRating: dto.avgRating,
    lastSubmissionAt:
      dto.lastSubmissionAt != null ? Date.parse(dto.lastSubmissionAt) : null,
  };
}
