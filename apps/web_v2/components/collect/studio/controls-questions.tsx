"use client";

import * as React from "react";
import {
  PlusIcon,
  TrashIcon,
  CaretUpIcon,
  CaretDownIcon,
  CopySimpleIcon,
  XIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useStudioDraft } from "@/lib/collect/studio-draft-context";
import {
  QUESTION_TYPE_META,
  type QuestionType,
  type ShowIfOp,
  type StudioQuestion,
} from "@/lib/collect/studio-types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SectionCollapsible,
  Row,
  StudioTextInput,
  StudioSelect,
  StudioToggle,
} from "./studio-primitives";

const TYPE_OPTIONS = (Object.keys(QUESTION_TYPE_META) as QuestionType[]).map(
  (t) => ({ value: t, label: QUESTION_TYPE_META[t].label }),
);

const OP_OPTIONS: { value: ShowIfOp; label: string }[] = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "is not" },
  { value: "gt", label: "greater than" },
  { value: "lt", label: "less than" },
  { value: "gte", label: "at least" },
  { value: "lte", label: "at most" },
  { value: "includes", label: "includes" },
];

/* ─── Options editor (radio / checkbox / dropdown) ───────────────────────── */

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <Row label="Options">
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <StudioTextInput
              value={opt}
              onChange={(v) => {
                const next = [...options];
                next[i] = v;
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(options.filter((_, idx) => idx !== i))}
              aria-label={`Remove option ${i + 1}`}
              disabled={options.length <= 1}
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-7 justify-start text-[11.5px] font-medium"
          onClick={() => onChange([...options, `Option ${options.length + 1}`])}
        >
          <PlusIcon className="mr-1 size-3" weight="bold" />
          Add option
        </Button>
      </div>
    </Row>
  );
}

/* ─── Conditional show-if editor ─────────────────────────────────────────── */

function ShowIfEditor({
  question,
  candidates,
  onChange,
}: {
  question: StudioQuestion;
  candidates: StudioQuestion[];
  onChange: (patch: Partial<StudioQuestion>) => void;
}) {
  const enabled = Boolean(question.showIf);
  return (
    <div className="mt-1 rounded-lg border border-border/60 bg-background/40 p-2.5">
      <StudioToggle
        label="Conditional"
        hint="Only show this question when an earlier answer matches."
        checked={enabled}
        onChange={(on) =>
          onChange({
            showIf: on
              ? {
                  questionId: candidates[0]?.id ?? "",
                  op: "eq",
                  value: "",
                }
              : null,
          })
        }
      />
      {enabled && question.showIf && candidates.length > 0 && (
        <div className="flex flex-col gap-2">
          <StudioSelect
            value={question.showIf.questionId}
            onChange={(v) =>
              onChange({ showIf: { ...question.showIf!, questionId: v } })
            }
            options={candidates.map((c) => ({
              value: c.id,
              label: c.label || c.id,
            }))}
          />
          <div className="flex gap-1.5">
            <div className="w-[44%]">
              <StudioSelect
                value={question.showIf.op}
                onChange={(v) =>
                  onChange({
                    showIf: { ...question.showIf!, op: v as ShowIfOp },
                  })
                }
                options={OP_OPTIONS}
              />
            </div>
            <div className="flex-1">
              <StudioTextInput
                value={String(question.showIf.value)}
                onChange={(v) =>
                  onChange({ showIf: { ...question.showIf!, value: v } })
                }
                placeholder="value"
              />
            </div>
          </div>
        </div>
      )}
      {enabled && candidates.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Add this question after another one to gate it on a prior answer.
        </p>
      )}
    </div>
  );
}

/* ─── Single question card ───────────────────────────────────────────────── */

function QuestionCard({
  question,
  index,
  total,
  candidates,
}: {
  question: StudioQuestion;
  index: number;
  total: number;
  candidates: StudioQuestion[];
}) {
  const { updateQuestion, removeQuestion, moveQuestion, duplicateQuestion } =
    useStudioDraft();
  const [open, setOpen] = React.useState(false);
  const meta = QUESTION_TYPE_META[question.type];

  const update = (patch: Partial<StudioQuestion>) =>
    updateQuestion(question.id, patch);

  return (
    <div className="rounded-lg border border-border bg-card/40">
      {/* Header row */}
      <div className="flex items-center gap-1.5 p-1.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[10px] text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 flex-col items-start text-left"
        >
          <span className="w-full truncate text-[12.5px] font-medium text-foreground">
            {question.label || meta.defaultLabel}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {meta.label}
            {question.required ? " · Required" : ""}
          </span>
        </button>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground disabled:opacity-30"
            onClick={() => moveQuestion(question.id, -1)}
            disabled={index === 0}
            aria-label="Move up"
          >
            <CaretUpIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground disabled:opacity-30"
            onClick={() => moveQuestion(question.id, 1)}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            <CaretDownIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Edit question"
          >
            <PencilSimpleIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor body */}
      {open && (
        <div className="border-t border-border/60 p-2.5">
          <Row label="Type">
            <StudioSelect
              value={question.type}
              onChange={(v) => {
                const type = v as QuestionType;
                const nextMeta = QUESTION_TYPE_META[type];
                update({
                  type,
                  options:
                    nextMeta.hasOptions && !question.options
                      ? ["Option 1", "Option 2"]
                      : question.options,
                });
              }}
              options={TYPE_OPTIONS}
            />
          </Row>
          <Row label="Label">
            <StudioTextInput
              value={question.label}
              onChange={(v) => update({ label: v })}
            />
          </Row>
          {(question.type === "shorttext" || question.type === "longtext") && (
            <Row label="Placeholder">
              <StudioTextInput
                value={question.placeholder ?? ""}
                onChange={(v) => update({ placeholder: v })}
              />
            </Row>
          )}
          {meta.hasOptions && (
            <OptionsEditor
              options={question.options ?? []}
              onChange={(next) => update({ options: next })}
            />
          )}
          <StudioToggle
            label="Required"
            checked={question.required}
            onChange={(v) => update({ required: v })}
          />
          <ShowIfEditor
            question={question}
            candidates={candidates}
            onChange={update}
          />
          <div className="mt-2 flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              className="h-7 px-2 text-[11.5px] text-muted-foreground"
              onClick={() => duplicateQuestion(question.id)}
            >
              <CopySimpleIcon className="mr-1 size-3.5" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              className="h-7 px-2 text-[11.5px] text-destructive hover:text-destructive"
              onClick={() => removeQuestion(question.id)}
            >
              <TrashIcon className="mr-1 size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Questions section ──────────────────────────────────────────────────── */

export function QuestionsSection() {
  const { draft, addQuestion } = useStudioDraft();
  const { questions } = draft;

  return (
    <SectionCollapsible
      title="Questions"
      tag={questions.length ? String(questions.length) : undefined}
    >
      <div className="flex flex-col gap-1.5">
        {questions.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[11.5px] text-muted-foreground">
            No questions yet. Add one below to start building the form.
          </p>
        )}
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            candidates={questions.slice(0, i)}
          />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="mt-2 w-full justify-center text-[12px] font-semibold"
          >
            <PlusIcon className="mr-1 size-3.5" weight="bold" />
            Add question
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {TYPE_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => addQuestion(opt.value)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SectionCollapsible>
  );
}
