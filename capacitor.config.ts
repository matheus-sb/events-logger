import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'events.logger',
  appName: 'events-logger',
  webDir: 'dist/events-logger',
  server: {
    androidScheme: 'https'
  }
};

export default config;
