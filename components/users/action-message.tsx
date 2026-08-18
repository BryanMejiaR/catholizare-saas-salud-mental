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
          ? "rounded-md border-l-4 border-azulMedio bg-enfasis/10 px-4 py-3 text-sm text-principal"
          : "rounded-md border-l-4 border-rojoRompe bg-rojoRompe/5 px-4 py-3 text-sm text-principal"
      }
    >
      {message}
    </p>
  );
}
