export default function calculatePrice(
  weight: number,
  collect: number
): number {
  const basePrice = 90;
  const perKgPrice = 20;

  const total =
    basePrice + Number(weight) * perKgPrice + Number(collect) * 0.01;

  return Number(total.toFixed(2));
}
