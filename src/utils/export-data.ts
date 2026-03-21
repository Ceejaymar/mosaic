import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';

import { db } from '@/src/db/client';
import { moodEntries } from '@/src/db/schema';

export async function exportDataToCSV() {
  try {
    const allEntries = await db.select().from(moodEntries);

    if (allEntries.length === 0) {
      alert('No data to export yet!');
      return;
    }

    const headers = Object.keys(allEntries[0]).join(',');

    const rows = allEntries.map((entry) =>
      Object.values(entry)
        .map((val) => {
          if (val === null || val === undefined) return '';
          const str = String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    const csvContent = [headers, ...rows].join('\n');

    // Use the new Expo 52 FileSystem API
    const file = new File(Paths.cache, 'mosaic_my_data.csv');

    // Create the file if it doesn't exist yet
    if (!file.exists) {
      file.create();
    }

    // Synchronously write the data (UTF-8 is the default)
    file.write(csvContent);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Download my data',
        UTI: 'public.comma-separated-values-text',
      });

      // SECURITY PATCH: Delete the file after the share sheet closes
      if (file.exists) {
        file.delete();
      }
    } else {
      alert('Sharing is not available on this device');
    }
  } catch (error: unknown) {
    console.error('Error exporting data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`Error: ${message}`);
  }
}
