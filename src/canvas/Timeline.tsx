import {
  useState,
  useRef,
  useEffect,
  type MouseEvent,
  type WheelEvent,
  useCallback,
} from 'react';

import {
  pixelToSecond,
  secondToPixel,
  dateToSeconds,
  timelineTickmarkFormatter,
  currentDatetimeFormatter,
} from './timeFormatter';

import { getTickInterval, getMinorTickInterval } from './util';
import { drawClipStartToEnd, drawLabel, drawTickstep } from './drawTimeline';

// Const.
const HITBOX_WIDTH = 10;
const TIMELINE_INITIAL_ZOOM = 80 / 3600;
// const AUTOSCROLL_THRESHOLD = 50;

interface TimelinePosition {
  x: number;
  y: number;
}

export function Timeline() {
  // state.
  const [timelineOption, setTimelineOption] = useState(() => {
    const now = new Date();
    return {
      current: now,
      start: new Date(now.getTime() - 3600 * 10000),
      end: new Date(now.getTime() + 3600 * 10000),
    };
  });
  const [zoom, setZoom] = useState(TIMELINE_INITIAL_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState<TimelinePosition | null>(
    null,
  );
  const [centerDate, setCenterDate] = useState(timelineOption.current);
  const [clipRangeDragging, setClipRangeDragging] = useState([false, false]);

  // Canvas 참조.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas 그리기.
  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 조정.
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pixelWidth = canvas.width / dpr;
    const pixelHeight = canvas.height / dpr;

    // 시간축 가로선.
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, pixelHeight / 2);
    ctx.lineTo(pixelWidth, pixelHeight / 2);
    ctx.stroke();

    // 뷰 안에서 보이는 타임라인의 시작과 끝은 centerDate를 기준으로 생성.
    const centerDateToSeconds = dateToSeconds(centerDate);
    const viewStart = centerDateToSeconds - pixelToSecond(pixelWidth / 2, zoom);
    const viewEnd = viewStart + pixelToSecond(pixelWidth, zoom);

    // 눈금 단위.
    const interval = getTickInterval(zoom);
    const minorInterval = getMinorTickInterval(zoom);

    // 주 눈금, 보조 눈금.
    drawTickstep(
      ctx,
      viewStart,
      viewEnd,
      pixelHeight,
      zoom,
      minorInterval,
      interval,
    );

    // 라벨.
    drawLabel(ctx, viewStart, viewEnd, interval, pixelHeight, zoom);

    // 시간 범위 표시.
    if (timelineOption.start && timelineOption.end) {
      drawClipStartToEnd(
        ctx,
        viewStart,
        viewEnd,
        timelineOption.start,
        timelineOption.end,
        zoom,
        pixelWidth,
        pixelHeight,
      );
    }

    // timestamp.
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    const text = 'Timestamp: ';
    ctx.fillText(
      text + currentDatetimeFormatter(centerDate),
      pixelWidth / 2,
      pixelHeight / 2 + 70,
    );
  }, [zoom, timelineOption, centerDate]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !timelineOption.start) return;

      const rect = canvas.getBoundingClientRect();
      const xOnCanvas = e.clientX - rect.left;

      const centerDateToSeconds = dateToSeconds(centerDate);
      const viewStart =
        centerDateToSeconds - pixelToSecond(rect.width / 2, zoom);
      const viewEnd = viewStart + pixelToSecond(rect.width, zoom);

      // clip 시작 바 X 좌표.
      const startBarSeconds = dateToSeconds(timelineOption.start);
      if (startBarSeconds >= viewStart) {
        const startBarX = secondToPixel(startBarSeconds - viewStart, zoom);
        if (Math.abs(xOnCanvas - startBarX) <= HITBOX_WIDTH) {
          setClipRangeDragging([true, false]);
        }
      }

      // clip 종료 바 x 좌표.
      const endBarSeconds = dateToSeconds(timelineOption.end);
      if (endBarSeconds <= viewEnd) {
        const endBarX = secondToPixel(endBarSeconds - viewStart, zoom);
        if (Math.abs(xOnCanvas - endBarX) <= HITBOX_WIDTH) {
          setClipRangeDragging([false, true]);
        }
      }

      setIsDragging(true);
      setLastPosition({ x: e.clientX, y: e.clientY });
    },
    [timelineOption, zoom, centerDate],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPosition(null);
    setClipRangeDragging([false, false]);
  }, [zoom, centerDate]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!lastPosition) return;
      const dx = e.clientX - lastPosition.x;
      const deltaTime = pixelToSecond(dx, zoom);

      if (clipRangeDragging[0]) {
        // clip 시작 바 움직이는 경우.
        const newClipStartDate = new Date(
          timelineOption.start.getTime() + deltaTime * 1000,
        );
        if (newClipStartDate < timelineOption.end) {
          setTimelineOption({
            ...timelineOption,
            start: newClipStartDate,
          });
          setLastPosition({ x: e.clientX, y: e.clientY });
        } else {
          setTimelineOption({
            ...timelineOption,
            start: new Date(timelineOption.end.getTime() - 1000),
          });
        }
      } else if (clipRangeDragging[1]) {
        // clip 종료 바 움직이는 경우.
        const newClipEndDate = new Date(
          timelineOption.end.getTime() + deltaTime * 1000,
        );
        if (newClipEndDate > timelineOption.start) {
          setTimelineOption({
            ...timelineOption,
            end: newClipEndDate,
          });
          setLastPosition({ x: e.clientX, y: e.clientY });
        } else {
          setTimelineOption({
            ...timelineOption,
            end: new Date(timelineOption.start.getTime() + 1000),
          });
        }
      } else if (isDragging && lastPosition) {
        setLastPosition({ x: e.clientX, y: e.clientY });
        setCenterDate(new Date(centerDate.getTime() - deltaTime * 1000));
      }
    },
    [
      isDragging,
      lastPosition,
      clipRangeDragging,
      setTimelineOption,
      timelineOption,
      zoom,
    ],
  );

  const onWheel = useCallback(
    (e: WheelEvent) => {
      const newZoom = e.deltaY > 0 ? zoom * 0.9 : zoom * 1.1;
      setZoom(Math.max(80 / 3600, Math.min(newZoom, 1)));
    },
    [zoom],
  );

  useEffect(() => {
    drawTimeline();
  }, [drawTimeline]);

  return (
    <div className="relative h-[600px] w-full bg-transparent px-4 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
      />
      <div className="absolute left-1/2 top-1/2 h-1/6 -translate-x-1/2 -translate-y-1/2 w-[2px] bg-blue-500 pointer-events-none" />
    </div>
  );
}
