import type { AnalyticsSummary } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isAnalyticsSummary(value: unknown): value is AnalyticsSummary {
  if (!isRecord(value)) return false;
  if (typeof value.roomCount !== 'number') return false;
  if (typeof value.totalEntries !== 'number') return false;
  if (typeof value.uniqueParticipants !== 'number') return false;
  if (!Array.isArray(value.participants)) return false;
  if (!Array.isArray(value.prompts)) return false;
  if (!isRecord(value.dateRange)) return false;
  if (value.dateRange.earliest !== null && typeof value.dateRange.earliest !== 'string') return false;
  if (value.dateRange.latest !== null && typeof value.dateRange.latest !== 'string') return false;
  if (value.publishedAt !== undefined && value.publishedAt !== null && typeof value.publishedAt !== 'string') {
    return false;
  }

  return value.participants.every((participant) =>
    isRecord(participant)
    && typeof participant.name === 'string'
    && typeof participant.count === 'number'
    && isStringArray(participant.rooms),
  ) && value.prompts.every((prompt) =>
    isRecord(prompt)
    && typeof prompt.prompt === 'string'
    && Array.isArray(prompt.entries)
    && isStringArray(prompt.uniqueNames)
    && prompt.entries.every((entry) =>
      isRecord(entry)
      && typeof entry.name === 'string'
      && typeof entry.room === 'string',
    ),
  );
}
