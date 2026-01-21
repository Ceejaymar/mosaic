import { validateFeelingsContent } from '../utils/validate-feelings';
import { FEELINGS_CONTENT } from './feelings.content';

if (__DEV__) {
  // defaults:
  // - sibling duplicates disallowed
  // - synonym-label collisions disallowed
  // - global label uniqueness OFF
  validateFeelingsContent(FEELINGS_CONTENT, {
    throwOnError: true,
    enforceGlobalUniqueLabels: false,
    enforceNoSynonymLabelCollision: false,
  });
}
