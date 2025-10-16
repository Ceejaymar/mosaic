import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function page() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text style={{ color: 'white' }}>page {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
