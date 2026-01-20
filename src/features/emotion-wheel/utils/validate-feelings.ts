export type ValidateOptions = {
  throwOnError?: boolean;
  maxExamplesPerIssue?: number;
};

export type ValidationOk = { ok: true };
export type ValidationErr = { ok: false; error: string };

export function validateFeelingsContent(
  content: {
    groups: Array<{ id: string }>;
    nodes: Array<{ id: string; groupId: string; parentId?: string | null }>;
  },
  opts: ValidateOptions = {},
): ValidationOk | ValidationErr {
  const throwOnError = opts.throwOnError ?? false;
  const maxExamples = opts.maxExamplesPerIssue ?? 20;

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

  if (issues.length === 0) return { ok: true };

  const error =
    `FEELINGS_CONTENT validation failed (${issues.length} issue(s)):\n` +
    issues.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

  if (throwOnError) throw new Error(error);
  return { ok: false, error };
}
