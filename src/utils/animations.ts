import { LayoutAnimation, Platform, UIManager } from 'react-native';

export const enableAndroidLayoutAnimations = () => {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
};

export const triggerSpringLayoutAnimation = () => {
  LayoutAnimation.configureNext({
    duration: 380,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.75,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.75,
    },
  });
};
