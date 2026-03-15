import slugify from "slugify";

type UserLookupClient = {
  user: {
    findUnique: (args: {
      where: { profileSlug: string };
      select: { id: true };
    }) => PromiseLike<{ id: string } | null>;
  };
};

export async function createUniqueProfileSlug(
  client: UserLookupClient,
  value: string,
  excludeUserId?: string
) {
  const base = slugify(value, { lower: true, strict: true }) || "creator";
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const existing = await client.user.findUnique({
      where: { profileSlug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeUserId) {
      return candidate;
    }

    suffix += 1;
  }
}
