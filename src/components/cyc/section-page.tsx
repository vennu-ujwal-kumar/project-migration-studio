import { Code2, Inbox } from "lucide-react";

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function SectionPage({
  eyebrow,
  title,
  description,
  emptyTitle = "Nothing here yet",
  emptyDescription = "There are no items to show in this section yet.",
}: SectionPageProps) {
  return (
    <div className="content-width space-y-8">
      <header className="space-y-3">
        <p className="section-kicker">{eyebrow}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </header>
      <div className="subtle-rule" />
      <section className="flex min-h-72 flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="empty-mark" aria-hidden="true">
          {title === "Dashboard" ? <Code2 size={20} /> : <Inbox size={20} />}
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-medium text-foreground">{emptyTitle}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
        </div>
      </section>
    </div>
  );
}