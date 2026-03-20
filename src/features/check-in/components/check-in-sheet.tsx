import { memo } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { CheckInFormInitialData } from '@/src/features/check-in/hooks/useCheckInForm';
import { CheckInFormUI } from './check-in-form-ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (nodeId: string, note?: string, tags?: string[]) => void;
  initialData?: CheckInFormInitialData;
  onViewFullDay?: () => void;
};

export const CheckInSheet = memo(function CheckInSheet({
  visible,
  onClose,
  onSave,
  initialData,
  onViewFullDay,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <CheckInFormUI
          key={`${initialData?.targetDate}-${initialData?.existingEntry?.id}`}
          initialData={initialData}
          onSave={onSave}
          onClose={onClose}
          onViewFullDay={onViewFullDay}
          showHandleBar
          isModal
        />
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
}));
