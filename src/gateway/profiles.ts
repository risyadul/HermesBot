export type BotProfile = {
  name: string;
  display_name?: string;
  description?: string;
  model?: string;
  provider?: string;
  is_default?: boolean;
  skill_count?: number;
};

export type ProfileListResult = { profiles?: BotProfile[] };

export async function listBots(client: { call<T>(method: string, params?: Record<string, unknown>): Promise<T> }): Promise<BotProfile[]> {
  const result = await client.call<ProfileListResult>("profiles.list", { include_sessions: false });
  if (!Array.isArray(result.profiles)) throw new Error("Invalid profiles.list response");
  return result.profiles.filter((profile) => typeof profile.name === "string");
}
