import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component
 * @param {'primary'|'ghost'|'danger'|'outline'} variant
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
    outline: `inline-flex items-center justify-center gap-2 font-medium rounded-xl
              transition-all duration-200 active:scale-95 text-gray-300
              border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5`,
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
