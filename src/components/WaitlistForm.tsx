import { useState, type CSSProperties, type FormEvent } from 'react';
import { colors, EASE } from '../theme';
import { CheckIcon } from './icons';

const inputBase: CSSProperties = {
  flex: 1,
  height: 56,
  padding: '0 18px',
  borderRadius: 14,
  background: colors.surfaceInset,
  border: '1px solid rgba(255,255,255,0.12)',
  color: colors.text,
  font: '500 16px Inter',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
};

const inputFocus: CSSProperties = {
  borderColor: 'rgba(32,214,168,0.6)',
  boxShadow: '0 0 0 4px rgba(32,214,168,0.10)',
};

const buttonBase: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  height: 56,
  padding: '0 24px',
  border: 'none',
  borderRadius: 14,
  background: colors.accent,
  color: '#06120E',
  font: '600 16px Inter',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: `transform .16s ${EASE}, box-shadow .2s`,
};

interface WaitlistFormProps {
  submitted: boolean;
  onSubmit: () => void;
  buttonLabel: string;
  successLabel: string;
  /** Extra styles applied to the <form>. */
  formStyle?: CSSProperties;
  /** Extra styles applied to the success panel. */
  successStyle?: CSSProperties;
  /** Centre the success panel's contents (CTA variant). */
  centerSuccess?: boolean;
}

/**
 * The e-mail capture used in both the hero and the closing CTA. Submitting
 * either instance flips the whole page into its "you're on the list" state,
 * matching the prototype's shared `data-form` / `data-form-ok` toggle.
 */
export function WaitlistForm({
  submitted,
  onSubmit,
  buttonLabel,
  successLabel,
  formStyle,
  successStyle,
  centerSuccess = false,
}: WaitlistFormProps) {
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (submitted) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: centerSuccess ? 'center' : undefined,
          gap: 11,
          height: 56,
          padding: '0 18px',
          borderRadius: 14,
          background: 'rgba(54,211,153,0.10)',
          border: '1px solid rgba(54,211,153,0.30)',
          ...successStyle,
        }}
      >
        <CheckIcon size={20} stroke={colors.success} />
        <span style={{ fontSize: 15, fontWeight: 500, color: colors.success }}>{successLabel}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, ...formStyle }}>
      <input
        type="email"
        required
        placeholder="you@trailhead.com"
        style={{ ...inputBase, ...(focused ? inputFocus : null) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="submit"
        style={{
          ...buttonBase,
          ...(hover ? { transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(32,214,168,0.30)' } : null),
          ...(active ? { transform: 'scale(0.97)' } : null),
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setActive(false);
        }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
