import { useMemo, forwardRef } from 'react';
import './ScrollFloat.css';

const ScrollFloat = forwardRef(
  (
    {
      children,
      containerClassName = '',
      textClassName = '',
      as: Tag = 'div',
    },
    ref,
  ) => {
    const text = typeof children === 'string' ? children : String(children ?? '');

    const splitText = useMemo(() => {
      return text.split('').map((char, index) => (
        <span
          className="scroll-float-char"
          aria-hidden="true"
          key={`${char}-${index}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }, [text]);

    return (
      <Tag ref={ref} className={`scroll-float ${containerClassName}`}>
        <span className={`scroll-float-text ${textClassName}`} aria-label={text}>
          {splitText}
        </span>
      </Tag>
    );
  },
);

ScrollFloat.displayName = 'ScrollFloat';

export default ScrollFloat;
