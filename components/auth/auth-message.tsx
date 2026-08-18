type AuthMessageProps = {
  message?: string;
};

export function AuthMessage({ message }: AuthMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-md border-l-4 border-rojoRompe bg-rojoRompe/5 px-4 py-3 text-sm leading-5 text-principal">
      {message}
    </p>
  );
}
