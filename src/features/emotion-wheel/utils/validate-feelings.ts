// src/features/emotion-wheel/utils/validate-feelings.ts

export type ValidateOptions = {
  throwOnError?: boolean;
  maxExamplesPerIssue?: number;

  /**
   * If true, disallow the same label anywhere in the wheel.
   * (You may want false if you allow repeated words across groups.)
   */
  enforceGlobalUniqueLabels?: boolean;

  /**
   * If true, disallow any synonym that matches ANY node label (after normalization).
   */
  enforceNoSynonymLabelCollision?: boolean;
};

export type ValidationOk = { ok: true };
export type ValidationErr = { ok: false; error: string };

function norm(s: string) {
  return (s ?? '').trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
}

export function validateFeelingsContent(
  content: {
    groups: Array<{ id: string }>;
    nodes: Array<{
      id: string;
      label?: string;
      groupId: string;
      level?: number;
      parentId?: string | null;
      synonyms?: string[];
    }>;
  },
  opts: ValidateOptions = {},
): ValidationOk | ValidationErr {
  const throwOnError = opts.throwOnError ?? false;
  const maxExamples = opts.maxExamplesPerIssue ?? 20;
  const enforceGlobalUniqueLabels = opts.enforceGlobalUniqueLabels ?? false;
  const enforceNoSynonymLabelCollision = opts.enforceNoSynonymLabelCollision ?? true;

  const issues: string[] = [];

  const groups = content.groups ?? [];
  const nodes = content.nodes ?? [];

  // Build group id set + detect duplicates
  const groupIdSet = new Set<string>();
  const duplicateGroupIds: string[] = [];
  for (const g of groups) {
    if (!g?.id) continue;
    if (groupIdSet.has(g.id)) duplicateGroupIds.push(g.id);
    groupIdSet.add(g.id);
  }
  if (duplicateGroupIds.length) {
    issues.push(
      `Duplicate group ids (${duplicateGroupIds.length}): ${duplicateGroupIds
        .slice(0, maxExamples)
        .join(', ')}${duplicateGroupIds.length > maxExamples ? ' …' : ''}`,
    );
  }

  // Build node id set + detect duplicates
  const nodeIdSet = new Set<string>();
  const duplicateNodeIds: string[] = [];
  for (const n of nodes) {
    if (!n?.id) continue;
    if (nodeIdSet.has(n.id)) duplicateNodeIds.push(n.id);
    nodeIdSet.add(n.id);
  }
  if (duplicateNodeIds.length) {
    issues.push(
      `Duplicate node ids (${duplicateNodeIds.length}): ${duplicateNodeIds
        .slice(0, maxExamples)
        .join(', ')}${duplicateNodeIds.length > maxExamples ? ' …' : ''}`,
    );
  }

  // Validate parentId references
  const missingParents: Array<{ nodeId: string; parentId: string }> = [];
  for (const n of nodes) {
    const parentId = n?.parentId ?? null;
    if (parentId && !nodeIdSet.has(parentId)) {
      missingParents.push({ nodeId: n.id, parentId });
    }
  }

  if (missingParents.length) {
    const examples = missingParents
      .slice(0, maxExamples)
      .map((x) => `${x.nodeId} → ${x.parentId}`)
      .join(', ');
    issues.push(
      `Missing parentId references (${missingParents.length}): ${examples}${
        missingParents.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  // Validate groupId references
  const missingGroups: Array<{ nodeId: string; groupId: string }> = [];
  for (const n of nodes) {
    const gid = n?.groupId;
    if (gid && !groupIdSet.has(gid)) {
      missingGroups.push({ nodeId: n.id, groupId: gid });
    }
  }
  if (missingGroups.length) {
    const examples = missingGroups
      .slice(0, maxExamples)
      .map((x) => `${x.nodeId} → ${x.groupId}`)
      .join(', ');
    issues.push(
      `Missing groupId references (${missingGroups.length}): ${examples}${
        missingGroups.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  // ---------- NEW: label validation ----------
  const labelById = new Map<string, string>();
  const labelSetGlobal = new Set<string>();
  const duplicateGlobalLabels: Array<{ id: string; label: string }> = [];

  for (const n of nodes) {
    const label = norm(n.label ?? '');
    if (!label) continue;
    labelById.set(n.id, label);

    if (enforceGlobalUniqueLabels) {
      if (labelSetGlobal.has(label)) duplicateGlobalLabels.push({ id: n.id, label });
      labelSetGlobal.add(label);
    } else {
      // still collect all labels to check synonym collisions later
      labelSetGlobal.add(label);
    }
  }

  if (duplicateGlobalLabels.length) {
    const examples = duplicateGlobalLabels
      .slice(0, maxExamples)
      .map((x) => `${x.id}(${x.label})`)
      .join(', ');
    issues.push(
      `Duplicate labels across wheel (${duplicateGlobalLabels.length}): ${examples}${
        duplicateGlobalLabels.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  // Duplicate sibling labels (same parentId + same level + same label)
  const siblingKeySet = new Set<string>();
  const duplicateSiblingLabels: Array<{ id: string; key: string }> = [];

  for (const n of nodes) {
    const label = norm(n.label ?? '');
    if (!label) continue;

    const parentId = n.parentId ?? 'ROOT';
    const level = typeof n.level === 'number' ? n.level : -1;

    const key = `${parentId}::${level}::${label}`;
    if (siblingKeySet.has(key)) duplicateSiblingLabels.push({ id: n.id, key });
    siblingKeySet.add(key);
  }

  if (duplicateSiblingLabels.length) {
    const examples = duplicateSiblingLabels
      .slice(0, maxExamples)
      .map((x) => `${x.id} (${x.key})`)
      .join(', ');
    issues.push(
      `Duplicate sibling labels (${duplicateSiblingLabels.length}): ${examples}${
        duplicateSiblingLabels.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  // ---------- NEW: synonyms validation ----------
  const synonymDuplicates: Array<{ id: string; synonym: string }> = [];
  const synonymLabelCollisions: Array<{ id: string; synonym: string }> = [];

  for (const n of nodes) {
    const syns = (n.synonyms ?? []).map(norm).filter(Boolean);

    // per-node unique synonyms
    const seen = new Set<string>();
    for (const s of syns) {
      if (seen.has(s)) synonymDuplicates.push({ id: n.id, synonym: s });
      seen.add(s);

      // optional: prevent synonym matching ANY node label (keeps wheel “clean”)
      if (enforceNoSynonymLabelCollision && labelSetGlobal.has(s)) {
        // allow synonym == own label? usually pointless -> still flag
        synonymLabelCollisions.push({ id: n.id, synonym: s });
      }
    }
  }

  if (synonymDuplicates.length) {
    const examples = synonymDuplicates
      .slice(0, maxExamples)
      .map((x) => `${x.id} → "${x.synonym}"`)
      .join(', ');
    issues.push(
      `Duplicate synonyms within a node (${synonymDuplicates.length}): ${examples}${
        synonymDuplicates.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  if (synonymLabelCollisions.length) {
    const examples = synonymLabelCollisions
      .slice(0, maxExamples)
      .map((x) => `${x.id} → "${x.synonym}"`)
      .join(', ');
    issues.push(
      `Synonyms collide with existing labels (${synonymLabelCollisions.length}): ${examples}${
        synonymLabelCollisions.length > maxExamples ? ' …' : ''
      }`,
    );
  }

  if (issues.length === 0) return { ok: true };

  const error =
    `FEELINGS_CONTENT validation failed (${issues.length} issue(s)):\n` +
    issues.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

  if (throwOnError) throw new Error(error);
  return { ok: false, error };
}
