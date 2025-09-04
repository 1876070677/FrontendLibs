export function getTickInterval(zoom: number) {
  if (zoom > 0.99) return 60;
  else if (zoom > 0.45) return 300;
  else if (zoom > 0.2) return 600;
  else if (zoom > 0.1) return 900;
  else if (zoom > 0.05) return 1800;
  else return 3600;
}

export function getMinorTickInterval(zoom: number) {
  if (zoom > 0.99) return 5;
  else if (zoom > 0.45) return 30;
  else if (zoom > 0.1) return 60;
  else return 300;
}
