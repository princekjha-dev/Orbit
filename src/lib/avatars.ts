/**
 * Orbit & Coworker Dots — Centralized Visual Avatar Configuration
 *
 * Exact Asset Mapping:
 * - Orbit: /favicon.svg
 * - Avis:  /dots/blue.png
 * - Quill: /dots/mint.png
 * - Relay: /dots/orange.png
 * - Scout: /dots/purple.png
 */

export const DOT_AVATARS = {
  Avis: "/dots/blue.png",
  Quill: "/dots/mint.png",
  Relay: "/dots/orange.png",
  Scout: "/dots/purple.png",
  Atlas: "/dots/blue.png",
  Forge: "/dots/orange.png",
  Signal: "/dots/mint.png",
} as const;

export const ORBIT_AVATAR = "/favicon.svg";

export type DotName = keyof typeof DOT_AVATARS;

/**
 * Returns the public avatar URL for a given Dot name or ID (case-insensitive).
 */
export function getDotAvatar(nameOrId?: string | null): string | undefined {
  if (!nameOrId) return undefined;
  const key = nameOrId.trim().toLowerCase();
  switch (key) {
    case "avis":
      return DOT_AVATARS.Avis;
    case "quill":
      return DOT_AVATARS.Quill;
    case "relay":
      return DOT_AVATARS.Relay;
    case "scout":
      return DOT_AVATARS.Scout;
    case "atlas":
      return DOT_AVATARS.Atlas;
    case "forge":
      return DOT_AVATARS.Forge;
    case "signal":
      return DOT_AVATARS.Signal;
    default:
      return undefined;
  }
}

/**
 * Returns the public avatar URL for a Dot or Orbit (case-insensitive).
 */
export function getAvatarForName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase();
  if (key === "orbit" || key === "orbit app" || key === "orbit platform" || key.startsWith("orbit ")) {
    return ORBIT_AVATAR;
  }
  return getDotAvatar(name);
}
