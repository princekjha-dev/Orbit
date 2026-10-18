import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { DOT_AVATARS, ORBIT_AVATAR, getDotAvatar, getAvatarForName } from "@/lib/avatars";
import { DOT_CONFIGS } from "@/lib/ai/groq/config";

describe("Orbit & Dot Avatar Asset Mappings", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("should have correct exact mappings defined in centralized constants", () => {
    expect(ORBIT_AVATAR).toBe("/favicon.svg");
    expect(DOT_AVATARS.Avis).toBe("/dots/blue.png");
    expect(DOT_AVATARS.Quill).toBe("/dots/mint.png");
    expect(DOT_AVATARS.Relay).toBe("/dots/orange.png");
    expect(DOT_AVATARS.Scout).toBe("/dots/purple.png");
  });

  it("should verify that all referenced image assets physically exist in public/", () => {
    const assets = [
      ORBIT_AVATAR,
      DOT_AVATARS.Avis,
      DOT_AVATARS.Quill,
      DOT_AVATARS.Relay,
      DOT_AVATARS.Scout,
    ];

    for (const asset of assets) {
      const filePath = path.join(publicDir, asset.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `Asset file must exist at ${filePath}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `Asset file at ${filePath} must not be empty`).toBeGreaterThan(0);
    }
  });

  it("should resolve getDotAvatar case-insensitively", () => {
    expect(getDotAvatar("avis")).toBe("/dots/blue.png");
    expect(getDotAvatar("Avis")).toBe("/dots/blue.png");
    expect(getDotAvatar("AVIS")).toBe("/dots/blue.png");

    expect(getDotAvatar("quill")).toBe("/dots/mint.png");
    expect(getDotAvatar("Quill")).toBe("/dots/mint.png");
    expect(getDotAvatar("QUILL")).toBe("/dots/mint.png");

    expect(getDotAvatar("relay")).toBe("/dots/orange.png");
    expect(getDotAvatar("Relay")).toBe("/dots/orange.png");
    expect(getDotAvatar("RELAY")).toBe("/dots/orange.png");

    expect(getDotAvatar("scout")).toBe("/dots/purple.png");
    expect(getDotAvatar("Scout")).toBe("/dots/purple.png");
    expect(getDotAvatar("SCOUT")).toBe("/dots/purple.png");

    expect(getDotAvatar("unknown")).toBeUndefined();
    expect(getDotAvatar(null)).toBeUndefined();
  });

  it("should resolve getAvatarForName for Orbit and all Dots", () => {
    expect(getAvatarForName("Orbit")).toBe("/favicon.svg");
    expect(getAvatarForName("orbit")).toBe("/favicon.svg");
    expect(getAvatarForName("Orbit Platform")).toBe("/favicon.svg");

    expect(getAvatarForName("Avis")).toBe("/dots/blue.png");
    expect(getAvatarForName("Quill")).toBe("/dots/mint.png");
    expect(getAvatarForName("Relay")).toBe("/dots/orange.png");
    expect(getAvatarForName("Scout")).toBe("/dots/purple.png");

    expect(getAvatarForName("Jane Doe")).toBeUndefined();
    expect(getAvatarForName(null)).toBeUndefined();
  });

  it("should have matching avatarUrl on DOT_CONFIGS", () => {
    expect(DOT_CONFIGS.avis.avatarUrl).toBe("/dots/blue.png");
    expect(DOT_CONFIGS.quill.avatarUrl).toBe("/dots/mint.png");
    expect(DOT_CONFIGS.relay.avatarUrl).toBe("/dots/orange.png");
    expect(DOT_CONFIGS.scout.avatarUrl).toBe("/dots/purple.png");
    expect(DOT_CONFIGS.atlas.avatarUrl).toBe("/dots/blue.png");
    expect(DOT_CONFIGS.forge.avatarUrl).toBe("/dots/orange.png");
    expect(DOT_CONFIGS.signal.avatarUrl).toBe("/dots/mint.png");
  });

  it("should resolve getDotAvatar for all Four Primary Dots", () => {
    expect(getDotAvatar("atlas")).toBe("/dots/blue.png");
    expect(getDotAvatar("scout")).toBe("/dots/purple.png");
    expect(getDotAvatar("forge")).toBe("/dots/orange.png");
    expect(getDotAvatar("signal")).toBe("/dots/mint.png");
  });
});
