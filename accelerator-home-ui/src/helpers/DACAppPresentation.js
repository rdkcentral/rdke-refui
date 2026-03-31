/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/**
 * Presentation helpers for DAC apps.
 *
 * These live outside the API layer so DACApi.js stays focused on
 * data fetching / caching while display-level concerns (default icons,
 * display-name derivation, exclusion filtering) are owned here.
 */

// Default icon for sideloaded apps that have no icon from DAC server or cache
export const SIDELOADED_APP_DEFAULT_ICON = "/images/apps/DACApp_455_255.png";

// Resolved names that should be excluded from the UI
const EXCLUDED_RESOLVED_NAMES = ["base", "wpe-develop", "wpe", "wpe-rdk", "refui", "cobalt"];

/**
 * Derive a human-readable display name from a reverse-domain packageId.
 * e.g. "com.example.my-cool-app" → "My Cool App"
 */
export function deriveNameFromPackageId(packageId) {
  if (typeof packageId !== "string") return "Unknown App";
  const parts = packageId.split(".");
  const lastPart = parts[parts.length - 1];
  // Capitalize first letter of each word and replace hyphens with spaces
  return lastPart
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


export function filterExcludedApps(apps) {
  return apps.filter(app => {
    const normalizedName = app.name?.toLowerCase().replace(/\s+/g, "-");
    return !EXCLUDED_RESOLVED_NAMES.includes(normalizedName);
  });
}
