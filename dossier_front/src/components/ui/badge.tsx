interface BadgeProps {
  variant?: 'secondary';
  className?: string;
  children: React.ReactNode;
}
export function Badge({ variant = 'secondary', className, children }: BadgeProps) {
  const variantClass = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantClass} ${className || ''}`}>
      {children}
    </span>
  );
}
