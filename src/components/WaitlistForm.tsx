import { useState, type CSSProperties, type FormEvent } from 'react';
import { colors } from '../theme';
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
  willChange: 'transform',
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
  /** Override the input background (the hero's is semi-transparent). */
  inputBackground?: string;
}

/**
 * The e-mail capture used in both the hero and the closing CTA. Submitting
 * either instance flips the whole page into its "you're on the list" state,
 * matching the prototype's shared `data-form` / `data-form-ok` toggle. The
 * submit button is magnetic, its lift is owned by the FX engine, not hover.
 */
export function WaitlistForm({
  submitted,
  onSubmit,
  buttonLabel,
  successLabel,
  formStyle,
  successStyle,
  centerSuccess = false,
  inputBackground,
}: WaitlistFormProps) {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (submitted) {
    return (
      <div
        data-form-ok
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
    <form data-form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, ...formStyle }}>
      {/* honeypot, bots fill this hidden field; humans never see it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <input
        type="email"
        required
        placeholder="you@trailhead.com"
        style={{ ...inputBase, ...(inputBackground ? { background: inputBackground } : null), ...(focused ? inputFocus : null) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button data-magnetic type="submit" style={buttonBase}>
        {buttonLabel}
      </button>
    </form>
  );
}
