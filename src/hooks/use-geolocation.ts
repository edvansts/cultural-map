/* eslint-disable @typescript-eslint/no-explicit-any */

type GeolocationPermissionState =
  | "unsupported"
  | "granted"
  | "denied"
  | "prompt"
  | "error";

export interface AskPermissionResult {
  state: GeolocationPermissionState;
  error?: any;
  currentPosition?: GeolocationPosition;
}

export const useGeoLocation = () => {
  async function askForPermission(): Promise<AskPermissionResult> {
    if (!navigator.permissions) {
      return Promise.resolve({ state: "unsupported" });
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      switch (permissionStatus.state) {
        case "granted":
          return Promise.resolve({ state: "granted" });
        case "denied":
          return Promise.resolve({ state: "denied" });
        case "prompt":
          return await promptPermission();
        default:
          return Promise.resolve({ state: "unsupported" });
      }
    } catch (error) {
      return Promise.resolve({ state: "error", error });
    }
  }

  function promptPermission() {
    return new Promise<AskPermissionResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            state: "granted",
            currentPosition: position,
          }),
        () => resolve({ state: "denied" }),
        { enableHighAccuracy: true }
      );
    });
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true }
      );
    });
  }
  return {
    askForPermission,
    promptPermission,
    getCurrentPosition,
  };
};
