export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-xl shadow-md border ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
