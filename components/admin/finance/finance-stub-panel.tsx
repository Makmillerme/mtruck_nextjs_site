export default function FinanceStubPanel({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  return (
    <div className="grid gap-1">
      <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
