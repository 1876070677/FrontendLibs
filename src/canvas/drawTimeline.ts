import {
  currentDatetimeFormatter,
  dateToSeconds,
  secondToPixel,
  timelineTickmarkFormatter,
} from './timeFormatter';

export function drawTickstep(
  ctx: CanvasRenderingContext2D,
  viewStart: number,
  viewEnd: number,
  height: number,
  zoom: number,
  minorTickInterval: number,
  tickInterval: number,
) {
  const firstTick = Math.floor(viewStart / tickInterval) * tickInterval;

  for (let time = firstTick; time <= viewEnd; time += minorTickInterval) {
    const x = secondToPixel(time - viewStart, zoom);

    ctx.beginPath();
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;

    if (Math.abs(time % tickInterval) < 0.001) {
      ctx.moveTo(x, height / 2 - 10);
      ctx.lineTo(x, height / 2 + 10);
    } else {
      ctx.moveTo(x, height / 2 - 5);
      ctx.lineTo(x, height / 2 + 5);
    }
    ctx.stroke();
  }
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  viewStart: number,
  viewEnd: number,
  tickInterval: number,
  height: number,
  zoom: number,
) {
  const firstTick = Math.floor(viewStart / tickInterval) * tickInterval;

  for (let time = firstTick; time <= viewEnd; time += tickInterval) {
    const x = secondToPixel(time - viewStart, zoom);

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timelineTickmarkFormatter(time * 1000), x, height / 2 + 30);
  }
}

export function drawTimestamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerDate: Date,
) {
  ctx.fillStyle = '#000000';
  ctx.font = '16px Arial';
  const text = 'Timestamp: ';
  ctx.fillText(
    text + currentDatetimeFormatter(centerDate),
    width / 2,
    height / 2 + 70,
  );
}

export function drawClipStartToEnd(
  ctx: CanvasRenderingContext2D,
  viewStart: number,
  viewEnd: number,
  start: Date,
  end: Date,
  zoom: number,
  width: number,
  height: number,
) {
  const startDateSeconds = dateToSeconds(start);
  const endDateSeconds = dateToSeconds(end);

  // 현재 타임라인 내에 클립의 시작 종료가 없는 경우.
  if (startDateSeconds > viewEnd || endDateSeconds < viewStart) return;

  // 초기화.
  let clipStart = 0;
  let clipEnd = width;

  // 경우 탐색 및 클립 시작 종료 바 그리기.
  ctx.beginPath();
  ctx.strokeStyle = '#f7ce49';
  ctx.lineWidth = 3;

  if (startDateSeconds > viewStart) {
    clipStart = secondToPixel(startDateSeconds - viewStart, zoom);
    ctx.moveTo(clipStart, height / 2 - 15);
    ctx.lineTo(clipStart, height / 2 + 15);
    ctx.stroke();
  }

  if (endDateSeconds < viewEnd) {
    clipEnd = secondToPixel(endDateSeconds - viewStart, zoom);
    ctx.moveTo(clipEnd, height / 2 - 15);
    ctx.lineTo(clipEnd, height / 2 + 15);
    ctx.stroke();
  }

  // 클립 범위 그리기.
  ctx.fillStyle = 'rgba(247, 206, 73, 0.5)'; // 반투명 노란색 (투명도 조절 가능)
  ctx.fillRect(clipStart, height / 2 - 12, clipEnd - clipStart, 24);
}
