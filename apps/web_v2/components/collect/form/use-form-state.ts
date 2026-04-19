import { useReducer, useCallback, useMemo } from "react";
import type { StudioQuestion } from "@/lib/collect/studio-types";
import { evalShowIf } from "@/lib/collect/studio-types";
import { validateQuestion } from "./validation";
import type { FormStatus } from "./form-context";

interface State {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  step: number;
  status: FormStatus;
}

type Action =
  | { type: "SET_VALUE"; id: string; value: unknown }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "CLEAR_ERROR"; id: string }
  | { type: "SET_STEP"; step: number }
  | { type: "SET_STATUS"; status: FormStatus };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        values: { ...state.values, [action.id]: action.value },
        errors: { ...state.errors, [action.id]: "" },
      };
    case "SET_ERRORS":
      return { ...state, errors: { ...state.errors, ...action.errors } };
    case "CLEAR_ERROR":
      return { ...state, errors: { ...state.errors, [action.id]: "" } };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_STATUS":
      return { ...state, status: action.status };
  }
}

const INIT: State = { values: {}, errors: {}, step: 0, status: "editing" };

export function useFormState(
  questions: StudioQuestion[],
  onSubmit?: (payload: unknown) => void,
) {
  const [state, dispatch] = useReducer(reducer, INIT);

  const visibleQuestions = useMemo(
    () => questions.filter((q) => evalShowIf(q, state.values)),
    [questions, state.values],
  );

  const setValue = useCallback((id: string, value: unknown) => {
    dispatch({ type: "SET_VALUE", id, value });
  }, []);

  const clearError = useCallback((id: string) => {
    dispatch({ type: "CLEAR_ERROR", id });
  }, []);

  const goNext = useCallback((): boolean => {
    const q = visibleQuestions[state.step];
    if (q) {
      const err = validateQuestion(q, state.values[q.id]);
      if (err) {
        dispatch({ type: "SET_ERRORS", errors: { [q.id]: err } });
        return false;
      }
    }
    dispatch({ type: "SET_STEP", step: state.step + 1 });
    return true;
  }, [visibleQuestions, state.step, state.values]);

  const goBack = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.max(0, state.step - 1) });
  }, [state.step]);

  const submit = useCallback(() => {
    const errs: Record<string, string> = {};
    for (const q of visibleQuestions) {
      const err = validateQuestion(q, state.values[q.id]);
      if (err) errs[q.id] = err;
    }
    if (Object.values(errs).some(Boolean)) {
      dispatch({ type: "SET_ERRORS", errors: errs });
      return;
    }
    dispatch({ type: "SET_STATUS", status: "submitting" });

    const payload = {
      answers: visibleQuestions.map((q) => ({
        questionId: q.id,
        type: q.type,
        value: state.values[q.id] ?? null,
      })),
      meta: { submittedAt: new Date().toISOString() },
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      console.log("[TestimonialForm] mock submit →", payload);
    }

    setTimeout(() => {
      dispatch({ type: "SET_STATUS", status: "success" });
    }, 600);
  }, [visibleQuestions, state.values, onSubmit]);

  return {
    values: state.values,
    errors: state.errors,
    status: state.status,
    step: state.step,
    totalSteps: visibleQuestions.length,
    visibleQuestions,
    setValue,
    clearError,
    goNext,
    goBack,
    submit,
  };
}
