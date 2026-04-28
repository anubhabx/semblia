import {
  MagnifyingGlass,
  Globe as GlobeIcon,
  Users,
  Article,
  Megaphone,
  DotsThree,
  ChatText as MessageSquareText,
  ShieldCheck,
  Notebook,
  Lightbulb,
  PuzzlePiece as PuzzleIcon,
} from "@phosphor-icons/react";

export type OnboardStep =
  | "profile"
  | "referral"
  | "intent"
  | "project"
  | "collection";
export const TOTAL_STEPS = 5;

export const STEP_INDEX: Record<OnboardStep, number> = {
  profile: 0,
  referral: 1,
  intent: 2,
  project: 3,
  collection: 4,
};

export const REFERRAL_SOURCES = [
  { id: "search", label: "Search engine", Icon: MagnifyingGlass },
  { id: "social", label: "Social media", Icon: GlobeIcon },
  { id: "forum", label: "Online forum", Icon: Users },
  { id: "blog", label: "Blog or article", Icon: Article },
  { id: "ad", label: "Online ad", Icon: Megaphone },
  { id: "other", label: "Other", Icon: DotsThree },
] as const;

export const INTENT_OPTIONS = [
  {
    id: "collect",
    label: "Collect customer testimonials",
    Icon: MessageSquareText,
  },
  {
    id: "social-proof",
    label: "Build social proof for my site",
    Icon: ShieldCheck,
  },
  { id: "internal", label: "Internal feedback & reviews", Icon: Notebook },
  {
    id: "case-studies",
    label: "Case studies & success stories",
    Icon: Lightbulb,
  },
  { id: "other", label: "Other", Icon: PuzzleIcon },
] as const;

export const SUGGESTIONS = [
  "My SaaS",
  "Client Work",
  "Agency Portfolio",
  "Personal Brand",
];
