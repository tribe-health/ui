import { browser } from '$app/env';
import { settings } from '$lib/stores/settings';
import { getEnvironment } from '$lib/utilities/get-environment';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { SettingsResponse } from '$types';

export const isCloudMatch = /(tmprl\.cloud|tmprl-test\.cloud)$/;

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const settingsResponse: SettingsResponse = await requestFromAPI(
    routeForApi('settings'),
    { request },
  );

  const EnvironmentOverride = getEnvironment();

  const settingsInformation = {
    auth: {
      enabled: !!settingsResponse?.Auth?.Enabled,
      options: settingsResponse?.Auth?.Options,
    },
    baseUrl:
      import.meta?.env?.VITE_API ?? browser ? window.location.origin : '',
    codec: {
      endpoint: settingsResponse?.Codec?.Endpoint,
      accessToken: settingsResponse?.Codec?.AccessToken,
    },
    defaultNamespace: settingsResponse?.DefaultNamespace || 'default', // API returns an empty string if default namespace is not configured
    showTemporalSystemNamespace: settingsResponse?.ShowTemporalSystemNamespace,
    notifyOnNewVersion: settingsResponse?.NotifyOnNewVersion,
    feedbackURL: settingsResponse?.FeedbackURL,
    runtimeEnvironment: {
      get isCloud() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'cloud';
        }

        return isCloudMatch.test(browser ? window.location.hostname : '');
      },
      get isLocal() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'local';
        }

        return isCloudMatch.test(browser ? window.location.hostname : '');
      },
      envOverride: Boolean(EnvironmentOverride),
    },
    version: settingsResponse?.Version,
  };

  settings.set(settingsInformation);

  return settingsInformation;
};
