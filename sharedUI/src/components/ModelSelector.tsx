"use client";

import React, { useEffect, useState } from "react";
import Icon from "./IconStyles";

export interface AIModel {
  id: string;
  label: string;
  desc: string;
  provider?: string;
  external?: boolean;
}

export const AI_MODELS: AIModel[] = [
  { id: "qwen3-4b",       label: "Qwen3 4B",       desc: "Fast · Local · Default" },
  { id: "qwen3-8b",       label: "Qwen3 8B",       desc: "Balanced · Local" },
  { id: "qwen3-14b",      label: "Qwen3 14B",      desc: "Smart · Local" },
  { id: "llama-3.1-8b",   label: "Llama 3.1 8B",   desc: "Fast · Local" },
  { id: "mistral-7b",     label: "Mistral 7B",     desc: "Efficient · Local" },
  { id: "deepseek-r1-7b", label: "DeepSeek R1 7B", desc: "Reasoning · Local" },
];

export const STORAGE_KEY        = "InForm_ai_model";
export const EXTERNAL_KEY       = "InForm_external_models";
export const DEFAULT_MODEL      = "qwen3-4b";
export const EXT_CHANGE_EVENT   = "inform-external-models-change";
export const MODEL_CHANGE_EVENT = "inform-model-change";

export interface ExternalModel {
  id:        string;
  provider:  string;       // "anthropic" | "openai" | "google" | "custom"
  modelId:   string;       // "claude-opus", "gpt-4o", ...
  label:     string;       // "Claude Opus"
  apiKey:    string;
  createdAt: string;
}

export function getStoredModel(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_MODEL;
}

export function setStoredModel(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(MODEL_CHANGE_EVENT, { detail: id }));
}

export function getExternalModels(): ExternalModel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXTERNAL_KEY);
    return raw ? (JSON.parse(raw) as ExternalModel[]) : [];
  } catch {
    return [];
  }
}

export function saveExternalModels(list: ExternalModel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXTERNAL_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EXT_CHANGE_EVENT, { detail: list }));
}

export function addExternalModel(model: Omit<ExternalModel, "id" | "createdAt">): ExternalModel {
  const entry: ExternalModel = {
    ...model,
    id:        `ext-${model.provider}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const list = getExternalModels();
  saveExternalModels([...list, entry]);
  return entry;
}

export function removeExternalModel(id: string) {
  const list = getExternalModels().filter((m) => m.id !== id);
  saveExternalModels(list);
  if (getStoredModel() === id) {
    setStoredModel(DEFAULT_MODEL);
  }
}

function externalToAIModel(m: ExternalModel): AIModel {
  return {
    id:       m.id,
    label:    m.label,
    desc:     `${m.modelId} · ${m.provider} · External`,
    provider: m.provider,
    external: true,
  };
}

interface ModelSelectorProps {
  variant?: "card" | "compact";
  onChange?: (id: string) => void;
}

export default function ModelSelector({ variant = "card", onChange }: ModelSelectorProps) {
  const [selected, setSelected] = useState<string>(DEFAULT_MODEL);
  const [externals, setExternals] = useState<ExternalModel[]>([]);

  useEffect(() => {
    setSelected(getStoredModel());
    setExternals(getExternalModels());

    const onModelChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setSelected(detail);
    };
    const onExtChange = (e: Event) => {
      const detail = (e as CustomEvent<ExternalModel[]>).detail;
      if (detail) setExternals(detail);
    };
    window.addEventListener(MODEL_CHANGE_EVENT, onModelChange);
    window.addEventListener(EXT_CHANGE_EVENT, onExtChange);
    return () => {
      window.removeEventListener(MODEL_CHANGE_EVENT, onModelChange);
      window.removeEventListener(EXT_CHANGE_EVENT, onExtChange);
    };
  }, []);

  const choose = (id: string) => {
    setSelected(id);
    setStoredModel(id);
    onChange?.(id);
  };

  const allModels: AIModel[] = [...AI_MODELS, ...externals.map(externalToAIModel)];

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <h3 style={S.title}>Model AI</h3>
        <p style={S.subtitle}>
          Pilih model bahasa untuk menjawab dan mengisi form. Default: <strong>Qwen3 4B</strong>.
          {externals.length > 0 && ` ${externals.length} model eksternal ditambahkan.`}
        </p>
      </div>

      <div style={variant === "compact" ? S.listCompact : S.list}>
        {allModels.map((m) => {
          const isActive = selected === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => choose(m.id)}
              style={{
                ...S.row,
                border: isActive ? "1px solid var(--teal)" : "1px solid var(--border)",
                background: isActive ? "rgba(0,212,200,0.07)" : "var(--card)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--panel)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--card)";
              }}
            >
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={S.rowName}>
                  {m.label}
                  {m.external && <span style={S.extBadge}>External</span>}
                </div>
                <div style={S.rowDesc}>{m.desc}</div>
              </div>
              {isActive && <Icon name="white-check" size={16} invert={false} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", gap: 12 },
  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 },
  subtitle: { fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  listCompact: { display: "flex", flexDirection: "column", gap: 4 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background .15s, border-color .15s",
    width: "100%",
  },
  rowName: { fontSize: 13, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 },
  rowDesc: { fontSize: 11, color: "var(--muted)", marginTop: 2 },
  extBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 99,
    background: "rgba(0,212,200,0.15)",
    color: "var(--teal)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
};
