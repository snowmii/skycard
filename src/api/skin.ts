export async function fetchSkinDataUri(
  uuid: string,
  username: string,
): Promise<string | null> {
  const identifiers = [
    encodeURIComponent(
      uuid.replaceAll("-", ""),
    ),
    encodeURIComponent(username),
  ];

  const urls = [
    `https://nmsr.nickac.dev/fullbody/${identifiers[0]}`,
    "https://mc-heads.net/body/" +
      `${identifiers[0]}/180/left`,
    "https://mc-heads.net/body/" +
      `${identifiers[1]}/180/left`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "image/png",
          "User-Agent":
            "skyblock-card-generator/0.1",
        },

        signal:
          AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        continue;
      }

      const mime =
        response.headers.get(
          "content-type",
        ) ?? "image/png";

      if (!mime.startsWith("image/")) {
        continue;
      }

      const bytes = Buffer.from(
        await response.arrayBuffer(),
      );

      if (bytes.length === 0) {
        continue;
      }

      return (
        `data:${mime};base64,` +
        bytes.toString("base64")
      );
    } catch {
      // Try the next renderer.
    }
  }

  return null;
}
