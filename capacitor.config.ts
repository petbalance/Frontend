import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.PETBALANCE_SERVER_URL?.trim();
if (!serverUrl || new URL(serverUrl).protocol !== 'https:') {
  throw new Error('PETBALANCE_SERVER_URL에 배포된 petbalance HTTPS 서버 주소를 설정하세요.');
}

const config: CapacitorConfig = {
  appId: 'ai.petbalance.app',
  appName: 'petbalance',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: false,
  },
};

export default config;
