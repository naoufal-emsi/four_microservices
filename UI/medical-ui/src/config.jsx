import { createContext, useContext, useState, useEffect } from 'react';

export const SERVICE_PATHS = {
  patients:      '/patients',
  medecins:      '/medecins',
  planning:      '/creneaux',
  rendezvous:    '/api/rendezvous',
  notifications: '/notifications',
};

const DEFAULT_CONFIG = {
  patients:      { ip: 'localhost', port: '8081' },
  medecins:      { ip: 'localhost', port: '8085' },
  planning:      { ip: 'localhost', port: '9090' },
  rendezvous:    { ip: 'localhost', port: '8083' },
  notifications: { ip: 'localhost', port: '8086' },
};

export { DEFAULT_CONFIG };

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  async function updateConfig(newConfig) {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });
    setConfig(newConfig);
  }

  function getApi(service, subPath = '') {
    const path = SERVICE_PATHS[service];
    if (import.meta.env.DEV) {
      return `/proxy/${service}${path}${subPath}`;
    }
    const s = config[service];
    return `http://${s.ip}:${s.port}${path}${subPath}`;
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, getApi }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
