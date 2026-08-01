interface MinecraftProfileResponse {
  id?: string;
  name?: string;
}

export interface MinecraftProfile {
  uuid: string;
  username: string;
}

export async function resolveMinecraftProfile(
  username: string,
): Promise<MinecraftProfile> {
  const url =
    "https://api.minecraftservices.com/" +
    "minecraft/profile/lookup/name/" +
    encodeURIComponent(username);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "skyblock-card-generator/0.1",
    },
  });

  if (response.status === 404) {
    throw new Error(`Minecraft player "${username}" was not found.`);
  }

  if (!response.ok) {
    throw new Error(
      `Minecraft lookup failed: ` + `${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as MinecraftProfileResponse;

  if (!body.id || !body.name) {
    throw new Error("Minecraft profile lookup returned invalid data.");
  }

  return {
    uuid: body.id.replaceAll("-", ""),
    username: body.name,
  };
}
