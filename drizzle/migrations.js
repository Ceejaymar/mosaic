// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './0000_many_cerise.sql';
import m0001 from './0001_loud_azazel.sql';
import m0002 from './0002_red_iron_fist.sql';
import m0003 from './0003_public_christian_walker.sql';
import m0004 from './0004_tense_starbolt.sql';
import m0005 from './0005_busy_princess_powerful.sql';
import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
  },
};
