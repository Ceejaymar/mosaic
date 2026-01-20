import { validateFeelingsContent } from '../utils/validate-feelings';
import { FEELINGS_CONTENT } from './feelings.content';

if (__DEV__) {
  validateFeelingsContent(FEELINGS_CONTENT, { throwOnError: true });
}
export { FEELINGS_CONTENT };
