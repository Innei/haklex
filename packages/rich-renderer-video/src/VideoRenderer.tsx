import { Slider } from '@base-ui/react/slider';
import type { VideoRendererProps } from '@haklex/rich-editor/renderers';
import { Download, Loader2, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as styles from './styles.css';

const PlayIcon = ({ size = 20 }: { size?: number }) => <Play size={size} />;
const PauseIcon = ({ size = 20 }: { size?: number }) => <Pause size={size} />;
const VolumeIcon = () => <Volume2 size={20} />;
const VolumeMuteIcon = () => <VolumeX size={20} />;
const DownloadIcon = () => <Download size={20} />;
const LoadingIcon = () => (
  <Loader2 className={`${styles.spin} ${styles.semanticClassNames.spin}`} size={20} />
);
const FullscreenIcon = () => <Maximize size={20} />;
const ExitFullscreenIcon = () => <Minimize size={20} />;

export const VideoRenderer: ComponentType<VideoRendererProps> = ({
  src,
  poster,
  width,
  height,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [indicator, setIndicator] = useState<{
    type: 'play' | 'pause';
    key: number;
  } | null>(null);
  const [draggingTime, setDraggingTime] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const dragWasPlayingRef = useRef(false);
  const indicatorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const indicatorKeyRef = useRef(0);

  const aspectRatio = useMemo(() => {
    if (width && height && width > 0 && height > 0) {
      return `${width} / ${height}`;
    }
    return '16 / 9';
  }, [height, width]);

  const showIndicator = useCallback((type: 'play' | 'pause') => {
    indicatorKeyRef.current += 1;
    setIndicator({ type, key: indicatorKeyRef.current });
    clearTimeout(indicatorTimerRef.current);
    indicatorTimerRef.current = setTimeout(() => setIndicator(null), 500);
  }, []);

  const play = useCallback(() => {
    void videoRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      play();
      showIndicator('play');
    } else {
      pause();
      showIndicator('pause');
    }
  }, [pause, play, showIndicator]);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clamped = Math.min(
      Math.max(0, time),
      Number.isFinite(video.duration) ? video.duration : time,
    );
    video.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      void wrapper.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  const downloadingRef = useRef(false);
  const downloadVideo = useCallback(() => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setIsDownloading(true);

    const filename = src.split('/').pop() || 'video';
    const fallback = () => {
      const a = document.createElement('a');
      a.href = src;
      a.download = filename;
      a.rel = 'noopener noreferrer';
      a.click();
    };

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      })
      .catch(() => fallback())
      .finally(() => {
        downloadingRef.current = false;
        setIsDownloading(false);
      });
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setMuted(video.muted);
    };
    const onDurationChange = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => setMuted(video.muted);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    return () => clearTimeout(indicatorTimerRef.current);
  }, []);

  const timelineValue = draggingTime ?? currentTime;

  return (
    <figure className={`${styles.root} ${styles.semanticClassNames.root}`}>
      <div
        className={`${styles.player} ${styles.semanticClassNames.player}`}
        ref={wrapperRef}
        style={{ aspectRatio }}
      >
        <video
          playsInline
          className={`${styles.element} ${styles.semanticClassNames.element}`}
          poster={poster}
          preload="metadata"
          ref={videoRef}
          src={src}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
        />

        {indicator && (
          <span
            aria-hidden
            className={`${styles.indicator} ${styles.semanticClassNames.indicator}`}
            key={indicator.key}
          >
            {indicator.type === 'play' ? <PlayIcon size={32} /> : <PauseIcon size={32} />}
          </span>
        )}

        <div
          className={`${styles.controls} ${styles.semanticClassNames.controls}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label={playing ? 'Pause' : 'Play'}
            className={`${styles.button} ${styles.semanticClassNames.button}`}
            type="button"
            onClick={togglePlay}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <Slider.Root
            className={`${styles.progress} ${styles.semanticClassNames.progress}`}
            max={duration || 0}
            min={0}
            step={0.01}
            value={timelineValue}
            onValueChange={(value) => {
              setDraggingTime(value);
            }}
            onValueCommitted={(value) => {
              seekTo(value);
              setDraggingTime(null);
              if (dragWasPlayingRef.current) {
                play();
              }
            }}
          >
            <Slider.Control
              className={`${styles.progressControl} ${styles.semanticClassNames.progressControl}`}
              onPointerDown={() => {
                dragWasPlayingRef.current = playing;
                pause();
                setDraggingTime(currentTime);
              }}
            >
              <Slider.Track
                className={`${styles.progressTrack} ${styles.semanticClassNames.progressTrack}`}
              >
                <Slider.Indicator
                  className={`${styles.progressRange} ${styles.semanticClassNames.progressRange}`}
                />
                <Slider.Thumb
                  aria-label="Playback progress"
                  className={`${styles.progressThumb} ${styles.semanticClassNames.progressThumb}`}
                />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>

          <button
            aria-label={muted ? 'Unmute' : 'Mute'}
            className={`${styles.button} ${styles.semanticClassNames.button}`}
            type="button"
            onClick={toggleMute}
          >
            {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
          </button>

          <button
            aria-label="Download"
            className={`${styles.button} ${styles.semanticClassNames.button}`}
            type="button"
            onClick={downloadVideo}
          >
            {isDownloading ? <LoadingIcon /> : <DownloadIcon />}
          </button>

          <button
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className={`${styles.button} ${styles.semanticClassNames.button}`}
            type="button"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>
    </figure>
  );
};
