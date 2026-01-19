import { desc, eq } from 'drizzle-orm';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { db } from '@/src/db/client';
import { moodEntries } from '@/src/db/schema';
import { uuid } from '@/src/lib/uuid';

export default function DebugDbScreen() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rows, setRows] = useState<any[]>([]);

  const insertTestRow = async () => {
    try {
      const now = new Date().toISOString();
      const id = uuid();

      await db.insert(moodEntries).values({
        id,
        date: now.slice(0, 10),
        primaryMood: 'happy',
        note: 'This is a test note',
        createdAt: now,
        updatedAt: now,
        occurredAt: now.slice(0, 19).replace('T', ' '),
      });
      console.log('inserted row', id);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const fetchRows = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const result = await db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.date, today))
        .orderBy(desc(moodEntries.occurredAt))
        .limit(20);
      console.log('resultssss', result);
      setRows(result);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: '600' }}>DB Debug</Text>
      <Text>{status}</Text>

      <Button title="Insert test entry" onPress={insertTestRow} />
      <Button title="Fetch today’s entries" onPress={fetchRows} />

      <View style={{ gap: 8 }}>
        {rows.map((r) => (
          <Text key={r.id}>
            {r.date} • {r.primaryMood} • {r.occurredAt}
          </Text>
        ))}
      </View>
    </View>
  );
}
