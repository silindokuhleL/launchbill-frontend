type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[#102019] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
        {description}
      </p>
    </header>
  );
}
