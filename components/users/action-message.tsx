type ActionMessageProps = {
  message?: string;
  ok?: boolean;
};

export function ActionMessage({ message, ok }: ActionMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={
        ok
          ? "rounded-md border border-moss/20 bg-moss/10 px-3 py-2 text-sm text-ink"
          : "rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-ink"
      }
    >
      {message}
    </p>
  );
}
