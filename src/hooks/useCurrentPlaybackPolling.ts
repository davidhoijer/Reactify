import {useCallback, useEffect, useRef, useState} from "react";
import {fetchCurrentSong} from "../api/spotifyApi";
import type {CurrentSong} from "../types/CurrentSong";
import type {PlaybackState} from "../components/CurrentSong";

const FAST_POLLRATE_MS = 1000;
const PAUSED_POLLRATE_MS = 7000;
const IDLE_POLLRATE_MS = 45000;
const EMPTY_RECHECK_MS = 1500;
const MAX_BACKOFF_MS = 60000;

interface CurrentPlaybackPollingState {
  currentSong: CurrentSong | null;
  playback: PlaybackState | null;
  loading: boolean;
  error: string | null;
}

type PollCurrentSong = (allowHidden?: boolean) => Promise<void>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isSameTrack(prev: CurrentSong | null, next: CurrentSong | null): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  return (
    prev.currently_playing_type === next.currently_playing_type &&
    prev.item?.id === next.item?.id &&
    prev.item?.album?.id === next.item?.album?.id &&
    prev.item?.album?.images?.[0]?.url === next.item?.album?.images?.[0]?.url
  );
}

function playbackFromSong(song: CurrentSong | null): PlaybackState | null {
  if (!song) return null;

  return {
    durationMs: song.item?.duration_ms ?? 0,
    progressMs: song.progress_ms ?? 0,
    isPlaying: song.is_playing,
    syncedAt: Date.now(),
  };
}

function jitter(ms: number): number {
  const delta = Math.floor(ms * 0.1);
  const rand = Math.floor(Math.random() * (delta * 2 + 1)) - delta;
  return Math.max(250, ms + rand);
}

function nextDelayFor(song: CurrentSong | null): number {
  if (!song) return IDLE_POLLRATE_MS;
  if (song.currently_playing_type === "track" && song.is_playing) return FAST_POLLRATE_MS;
  return PAUSED_POLLRATE_MS;
}

export function useCurrentPlaybackPolling(enabled: boolean): CurrentPlaybackPollingState {
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stoppedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  const errorBackoffRef = useRef(0);
  const emptyPlaybackCountRef = useRef(0);
  const initialPollCompleteRef = useRef(false);
  const currentSongRef = useRef<CurrentSong | null>(null);
  const pollRef = useRef<PollCurrentSong>(async () => undefined);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const schedule = useCallback((ms: number) => {
    if (stoppedRef.current) return;
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      pollRef.current();
    }, jitter(ms));
  }, [clearTimer]);

  const poll = useCallback<PollCurrentSong>(async (allowHidden = false) => {
    if (stoppedRef.current || (!allowHidden && document.hidden)) return;

    try {
      const song = await fetchCurrentSong();
      if (stoppedRef.current) return;

      if (song) {
        emptyPlaybackCountRef.current = 0;
        const nextSong = isSameTrack(currentSongRef.current, song) ? currentSongRef.current : song;
        currentSongRef.current = nextSong;
        setCurrentSong(nextSong);
        setPlayback(playbackFromSong(song));
        setError(null);
        errorBackoffRef.current = 0;
        schedule(nextDelayFor(song));
        return;
      }

      emptyPlaybackCountRef.current += 1;

      if (currentSongRef.current && emptyPlaybackCountRef.current === 1) {
        errorBackoffRef.current = 0;
        schedule(EMPTY_RECHECK_MS);
        return;
      }

      currentSongRef.current = null;
      setCurrentSong(null);
      setPlayback(null);
      setError(null);
      errorBackoffRef.current = 0;
      schedule(nextDelayFor(null));
    } catch (err) {
      console.error("Error fetching current song:", err);
      if (!initialPollCompleteRef.current) {
        setError(errorMessage(err));
      }

      const prev = errorBackoffRef.current || 2000;
      const next = Math.min(prev * 2, MAX_BACKOFF_MS);
      errorBackoffRef.current = next;
      schedule(next);
    } finally {
      if (!stoppedRef.current) {
        initialPollCompleteRef.current = true;
        setLoading(false);
      }
    }
  }, [schedule]);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  useEffect(() => {
    if (!enabled) {
      stoppedRef.current = true;
      clearTimer();
      currentSongRef.current = null;
      emptyPlaybackCountRef.current = 0;
      errorBackoffRef.current = 0;
      initialPollCompleteRef.current = false;
      setCurrentSong(null);
      setPlayback(null);
      setLoading(false);
      setError(null);
      return;
    }

    stoppedRef.current = false;
    setLoading(true);
    pollRef.current(true);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer();
        return;
      }

      schedule(0);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stoppedRef.current = true;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearTimer, enabled, schedule]);

  return {
    currentSong,
    playback,
    loading: enabled && !initialPollCompleteRef.current ? true : loading,
    error,
  };
}
