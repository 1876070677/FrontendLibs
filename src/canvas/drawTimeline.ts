import { timelineTickmarkFormatter } from './timeFormatter';

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
    const x = (time - viewStart) * zoom;

    // 눈금 선 그리기
    ctx.beginPath();
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;

    // 메인 눈금인지 확인
    if (Math.abs(time % tickInterval) < 0.001) {
      // 메인 눈금 (큰 눈금)
      // 메인 눈금은 길게 그립니다.
      ctx.moveTo(x, height / 2 - 10);
      ctx.lineTo(x, height / 2 + 10);

      // 메인 눈금에만 라벨을 그립니다.
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(timelineTickmarkFormatter(time * 1000), x, height / 2 + 30);
    } else {
      // 보조 눈금 (작은 눈금)
      // 보조 눈금은 짧게 그립니다.
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
    const x = (time - viewStart) * zoom;

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timelineTickmarkFormatter(time * 1000), x, height / 2 + 30);
  }
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
) {}
