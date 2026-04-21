import {
  ChatText as MessageSquareText,
  PuzzlePiece as PuzzleIcon,
  ChartBar as BarChart3,
} from "@phosphor-icons/react";

export type OnboardStep = "name" | "welcome" | "project" | "ready";
export const TOTAL_STEPS = 4;

export const VALUE_PROPS = [
  {
    icon: MessageSquareText,
    title: "Collect",
    desc: "Gather testimonials via customizable forms with automatic follow-ups.",
  },
  {
    icon: PuzzleIcon,
    title: "Curate",
    desc: "Review, moderate, and organize feedback from one clean inbox.",
  },
  {
    icon: BarChart3,
    title: "Convert",
    desc: "Embed widgets that turn social proof into measurable growth.",
  },
];

export const SUGGESTIONS = [
  "My SaaS",
  "Client Work",
  "Agency Portfolio",
  "Personal Brand",
];
