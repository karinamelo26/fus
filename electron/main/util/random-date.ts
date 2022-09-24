export function randomDate(start: Date, end: Date): Date {
  return new Date(+start + Math.random() * (+end - +start));
}
