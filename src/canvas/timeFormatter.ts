export function dateToSeconds(date: Date) {
  return date.getTime() / 1000;
}

export function pixelToSecond(pixel: number, zoom: number) {
  return pixel / zoom;
}

export function secondToPixel(second: number, zoom: number) {
  return second * zoom;
}

export function timelineTickmarkFormatter(time: number): string {
  const totalSeconds = new Date(time);

  const hours = totalSeconds.getHours();
  const minutes = totalSeconds.getMinutes();
  const seconds = totalSeconds.getSeconds();

  // HH:MM:SS (앞에 0 붙이기)
  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');

  return `${hStr}:${mStr}:${sStr}`;
}

export function currentDatetimeFormatter(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
