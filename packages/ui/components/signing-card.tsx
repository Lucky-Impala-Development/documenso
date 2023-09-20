'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image, { StaticImageData } from 'next/image';

import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';

import { cn } from '@documenso/ui/lib/utils';
import { Card, CardContent } from '@documenso/ui/primitives/card';

export type SigningCardProps = {
  name: string;
  signingCelebrationImage?: StaticImageData;
};

/**
 * 2D signing card.
 */
export const SigningCard = ({ name, signingCelebrationImage }: SigningCardProps) => {
  return (
    <div className="relative w-full max-w-xs md:max-w-sm">
      <SigningCardContent name={name} />

      {signingCelebrationImage && (
        <SigningCardImage signingCelebrationImage={signingCelebrationImage} />
      )}
    </div>
  );
};

/**
 * 3D signing card that follows the mouse movement within a certain range.
 */
export const SigningCard3D = ({ name, signingCelebrationImage }: SigningCardProps) => {
  // Should use % based dimensions by calculating the window height/width.
  const boundary = 400;

  const [trackMouse, setTrackMouse] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const rotateX = useTransform(cardY, [-600, 600], [8, -8]);
  const rotateY = useTransform(cardX, [-600, 600], [-8, 8]);

  const diagonalMovement = useTransform<number, number>(
    [rotateX, rotateY],
    ([newRotateX, newRotateY]) => newRotateX + newRotateY,
  );

  const sheenPosition = useTransform(diagonalMovement, [-16, 16], [-100, 200]);
  const sheenOpacity = useTransform(sheenPosition, [-100, 50, 200], [0, 0.1, 0]);
  const sheenGradient = useMotionTemplate`linear-gradient(
    30deg,
    transparent,
    rgba(200 200 200 / ${trackMouse ? sheenOpacity : 0}) ${sheenPosition}%,
    transparent)`;

  const cardRef = useRef<HTMLDivElement>(null);

  const cardCenterPosition = useCallback(() => {
    if (!cardRef.current) {
      return { x: 0, y: 0 };
    }

    const { x, y, width, height } = cardRef.current.getBoundingClientRect();

    return { x: x + width / 2, y: y + height / 2 };
  }, [cardRef]);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const { x, y } = cardCenterPosition();

      const offsetX = event.clientX - x;
      const offsetY = event.clientY - y;

      // Calculate distance between the mouse pointer and center of the card.
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

      // Mouse enters enter boundary.
      if (distance <= boundary && !trackMouse) {
        setTrackMouse(true);
      }

      if (!trackMouse) {
        return;
      }

      void animate(cardX, offsetX, { duration: 0.125 });
      void animate(cardY, offsetY, { duration: 0.125 });

      clearTimeout(timeoutRef.current);

      // Revert the card back to the center position after the mouse stops moving.
      timeoutRef.current = setTimeout(() => {
        void animate(cardX, 0, { duration: 2, ease: 'backInOut' });
        void animate(cardY, 0, { duration: 2, ease: 'backInOut' });

        setTrackMouse(false);
      }, 1000);
    },
    [cardX, cardY, cardCenterPosition, trackMouse],
  );

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [onMouseMove]);

  return (
    <div className="relative w-full max-w-xs md:max-w-sm" style={{ perspective: 800 }}>
      <motion.div
        className="bg-background w-full"
        ref={cardRef}
        style={{
          perspective: '800',
          backgroundImage: sheenGradient,
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
        }}
      >
        <SigningCardContent className="bg-transparent" name={name} />
      </motion.div>

      {signingCelebrationImage && (
        <SigningCardImage signingCelebrationImage={signingCelebrationImage} />
      )}
    </div>
  );
};

type SigningCardContentProps = {
  name: string;
  className?: string;
};

const SigningCardContent = ({ className, name }: SigningCardContentProps) => {
  return (
    <Card
      className={cn(
        'group mx-auto flex aspect-[21/9] w-full items-center justify-center',
        className,
      )}
      degrees={-145}
      gradient
    >
      <CardContent
        className="font-signature p-6 text-center"
        style={{
          container: 'main',
        }}
      >
        <span
          className="text-muted-foreground/60 group-hover:text-primary/80 break-all font-semibold duration-300"
          style={{
            fontSize: `max(min(4rem, ${(100 / name.length / 2).toFixed(4)}cqw), 1.875rem)`,
          }}
        >
          {name}
        </span>
      </CardContent>
    </Card>
  );
};

type SigningCardImageProps = {
  signingCelebrationImage: StaticImageData;
};

const SigningCardImage = ({ signingCelebrationImage }: SigningCardImageProps) => {
  return (
    <motion.div
      className="pointer-events-none absolute -inset-32 -z-10 flex items-center justify-center md:-inset-44 xl:-inset-60 2xl:-inset-80"
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        scale: 1,
        opacity: 0.5,
      }}
      transition={{
        delay: 0.5,
        duration: 0.5,
      }}
    >
      <Image
        src={signingCelebrationImage}
        alt="background pattern"
        className="w-full"
        style={{
          mask: 'radial-gradient(rgba(255, 255, 255, 1) 0%, transparent 67%)',
          WebkitMask: 'radial-gradient(rgba(255, 255, 255, 1) 0%, transparent 67%)',
        }}
      />
    </motion.div>
  );
};
