import * as Haptics from 'expo-haptics';

export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error(error);
  }
}

export async function hapticSelection() {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.error(error);
  }
}
