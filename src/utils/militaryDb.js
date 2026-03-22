export function recommendUniformSizes(measurements = {}) {
  const heightMm = Number(measurements?.height_mm ?? measurements?.heightMm ?? 0);
  const weightKg = Number(measurements?.weight_kg ?? measurements?.weightKg ?? 0);

  let top = "95";
  let bottom = "30";
  let shoes = "260";
  let outer = "95";

  if (heightMm >= 1700) {
    top = "100";
    outer = "100";
  }
  if (heightMm >= 1780) {
    top = "105";
    outer = "105";
    shoes = "270";
  }
  if (heightMm >= 1840) {
    top = "110";
    outer = "110";
    shoes = "280";
  }

  if (weightKg >= 72) bottom = "32";
  if (weightKg >= 82) bottom = "34";
  if (weightKg >= 92) bottom = "36";

  return [
    { itemName: "전투복 상의", size: top, quantity: 1 },
    { itemName: "전투복 하의", size: bottom, quantity: 1 },
    { itemName: "방한복", size: outer, quantity: 1 },
    { itemName: "전투화", size: shoes, quantity: 1 },
  ];
}
