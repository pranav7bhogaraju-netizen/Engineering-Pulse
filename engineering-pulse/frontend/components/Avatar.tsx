function getInitials(name: string | null | undefined) {
  const source = name?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Avatar({
  name,
  image,
  size = 20,
}: {
  name: string | null | undefined;
  image?: string | null;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full overflow-hidden bg-copper text-ink font-mono shrink-0 align-middle"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
