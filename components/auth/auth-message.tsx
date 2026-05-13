type AuthMessageProps = {
  message?: string;
};

export function AuthMessage({ message }: AuthMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-sm leading-5 text-ink">
      {message}
    </p>
  );
}
