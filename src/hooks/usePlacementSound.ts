import { useCallback, useRef } from "react";

type AudioContextConstructor =
  | typeof AudioContext
  | (typeof window & { webkitAudioContext?: typeof AudioContext })["webkitAudioContext"];

const getAudioContextClass = (): AudioContextConstructor | undefined => {
  if (typeof window === "undefined") return undefined;

  const AudioContextClass =
    window.AudioContext ||
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  return AudioContextClass ?? undefined;
};

const usePlacementSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playPlacementSound = useCallback(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContextClass();
      } catch {
        return;
      }
    }

    const context = audioContextRef.current;
    if (!context) return;

    const triggerTone = (ctx: AudioContext) => {
      const duration = 0.18;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gainNode).connect(ctx.destination);

      const startTime = ctx.currentTime + 0.02;
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    if (context.state === "suspended") {
      context
        .resume()
        .then(() => triggerTone(context))
        .catch(() => {});
      return;
    }

    triggerTone(context);
  }, []);

  return playPlacementSound;
};

export default usePlacementSound;
