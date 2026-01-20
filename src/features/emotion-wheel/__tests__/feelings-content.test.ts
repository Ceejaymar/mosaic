import { FEELINGS_CONTENT } from '../constants/feelings';
import { validateFeelingsContent } from '../utils/validate-feelings';

describe('Emotion Wheel – FEELINGS_CONTENT integrity', () => {
  it('has unique node ids and valid references', () => {
    const res = validateFeelingsContent(FEELINGS_CONTENT);
    if (!res.ok) {
      throw new Error(res.error);
    }
  });
});
