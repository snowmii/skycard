export interface HypixelProfile {
  profile_id: string;
  cute_name: string;
  selected?: boolean;

  banking?: {
    balance?: number;
  };

  members: Record<
    string,
    Record<string, unknown>
  >;
}

export interface HypixelSkillLevel {
  level?: number;
  totalExpRequired?: number;
}

export interface HypixelSkillResource {
  name?: string;
  maxLevel?: number;
  levels?: HypixelSkillLevel[];
}

export interface HypixelPlayer {
  rank?: string;
  packageRank?: string;
  newPackageRank?: string;
  monthlyPackageRank?: string;
}

interface HypixelProfilesResponse {
  success: boolean;
  cause?: string;
  profiles?: HypixelProfile[] | null;
}

interface HypixelSkillsResponse {
  success: boolean;
  cause?: string;
  skills?: Record<
    string,
    HypixelSkillResource
  >;
}

interface HypixelPlayerResponse {
  success: boolean;
  cause?: string;
  player?: HypixelPlayer | null;
}

interface HypixelApiResponse {
  success: boolean;
  cause?: string;
}

export class HypixelClient {
  public constructor(
    private readonly apiKey: string,
  ) {
    if (!apiKey) {
      throw new Error(
        "HYPIXEL_API_KEY is missing.",
      );
    }
  }

  public async getProfiles(
    uuid: string,
  ): Promise<HypixelProfile[]> {
    const body =
      await this.request<HypixelProfilesResponse>(
        "/v2/skyblock/profiles",
        {
          uuid,
        },
      );

    if (!body.profiles?.length) {
      throw new Error(
        "The player has no accessible SkyBlock profiles.",
      );
    }

    return body.profiles;
  }

  public async getSkillResources(): Promise<
    Record<string, HypixelSkillResource>
  > {
    const body =
      await this.request<HypixelSkillsResponse>(
        "/v2/resources/skyblock/skills",
        {},
      );

    return body.skills ?? {};
  }

  public async getPlayer(
    uuid: string,
  ): Promise<HypixelPlayer | null> {
    const body =
      await this.request<HypixelPlayerResponse>(
        "/v2/player",
        {
          uuid,
        },
      );

    return body.player ?? null;
  }

  private async request<
    T extends HypixelApiResponse,
  >(
    path: string,
    parameters: Record<string, string>,
  ): Promise<T> {
    const url = new URL(
      `https://api.hypixel.net${path}`,
    );

    for (
      const [key, value]
      of Object.entries(parameters)
    ) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: {
        "API-Key": this.apiKey,
        Accept: "application/json",
        "User-Agent":
          "skyblock-card-generator/0.1",
      },
    });

    if (response.status === 429) {
      const reset =
        response.headers.get(
          "RateLimit-Reset",
        );

      throw new Error(
        reset
          ? `Hypixel rate limit reached. Reset in ${reset}s.`
          : "Hypixel rate limit reached.",
      );
    }

    if (!response.ok) {
      throw new Error(
        `Hypixel API request failed: ` +
        `${response.status} ${response.statusText}`,
      );
    }

    const body =
      await response.json() as T;

    if (!body.success) {
      throw new Error(
        body.cause ??
        "Hypixel API request failed.",
      );
    }

    return body;
  }
}

export function selectProfile(
  profiles: HypixelProfile[],
  requestedName?: string,
): HypixelProfile {
  if (requestedName) {
    const requested =
      requestedName.toLowerCase();

    const profile = profiles.find(
      (candidate) =>
        candidate.cute_name.toLowerCase() ===
        requested,
    );

    if (!profile) {
      throw new Error(
        `SkyBlock profile "${requestedName}" was not found.`,
      );
    }

    return profile;
  }

  const selected = profiles.find(
    (profile) => profile.selected,
  );

  if (selected) {
    return selected;
  }

  const first = profiles[0];

  if (!first) {
    throw new Error(
      "No SkyBlock profiles were returned.",
    );
  }

  return first;
}
