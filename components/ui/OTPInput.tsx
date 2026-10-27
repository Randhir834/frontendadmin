'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export default function OTPInput({
  length = 4,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Parse the current value into individual digits
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      requestAnimationFrame(() => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
      });
      setFocusedIndex(index);
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    // Extract only digits from the input
    const newDigit = inputValue.replace(/[^0-9]/g, '');
    
    if (newDigit.length === 0) {
      // Handle deletion
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (newDigit.length === 1) {
      // Single digit input
      const newDigits = [...digits];
      newDigits[index] = newDigit;
      onChange(newDigits.join(''));
      
      // Auto-focus next input after state update
      if (index < length - 1) {
        setTimeout(() => focusInput(index + 1), 0);
      }
    } else if (newDigit.length > 1) {
      // Multiple digits pasted or typed fast
      handleMultipleDigits(newDigit, index);
    }
  };

  const handleMultipleDigits = (digitsString: string, startIndex: number) => {
    const cleaned = digitsString.replace(/[^0-9]/g, '').slice(0, length);
    const newDigits = [...digits];
    
    // Fill from the start index
    for (let i = 0; i < cleaned.length && startIndex + i < length; i++) {
      newDigits[startIndex + i] = cleaned[i];
    }
    
    onChange(newDigits.join(''));
    
    // Focus the next empty box or the last filled box
    const nextIndex = Math.min(startIndex + cleaned.length, length - 1);
    setTimeout(() => focusInput(nextIndex), 0);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (digits[index]) {
        // Clear current input
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        setTimeout(() => focusInput(index - 1), 0);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
    }
  };

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const cleaned = pastedData.replace(/[^0-9]/g, '').slice(0, length);
    
    if (cleaned.length > 0) {
      onChange(cleaned.padEnd(length, '').slice(0, length));
      // Focus the last filled digit
      const nextIndex = Math.min(cleaned.length, length - 1);
      setTimeout(() => focusInput(nextIndex), 0);
    }
  };

  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const inputValue = input.value;
    
    // If user types when there's already a digit, replace it
    if (inputValue.length > 1) {
      const lastChar = inputValue.slice(-1);
      if (/[0-9]/.test(lastChar)) {
        handleChange(index, lastChar);
      }
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className="flex gap-2 xs:gap-3 sm:gap-4 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
          onInput={(e: React.FormEvent<HTMLInputElement>) => handleInput(index, e)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
          onPaste={handlePasteEvent}
          onFocus={() => {
            setFocusedIndex(index);
            // Select the content when focusing
            setTimeout(() => inputRefs.current[index]?.select(), 0);
          }}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          autoComplete="off"
          className={`
            w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16
            text-center text-xl xs:text-2xl sm:text-3xl font-bold
            rounded-xl border-2 
            ${error 
              ? 'border-red-500 bg-red-50 text-red-700' 
              : focusedIndex === index
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : digit
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 bg-white text-gray-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            focus:outline-none focus:ring-2 
            ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            transition-all duration-200
            shadow-sm hover:shadow-md
            touch-target
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
