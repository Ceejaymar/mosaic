import { render } from '@testing-library/react-native';

import { MonoText } from '../StyledText';

describe('MonoText', () => {
  it('renders correctly with text', () => {
    const { getByText } = render(<MonoText>Snapshot test!</MonoText>);
    expect(getByText('Snapshot test!')).toBeTruthy();
  });
});
