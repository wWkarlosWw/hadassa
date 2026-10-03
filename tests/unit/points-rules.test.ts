import { describe, expect, it } from "vitest";
import { canAfford, levelFor, LEVELS, pointsForDonation } from "@/modules/points/rules";

describe("pointsForDonation", () => {
  it("otorga puntos proporcionales al monto", () => {
    expect(pointsForDonation(100, 10)).toBe(1000);
    expect(pointsForDonation(15.75, 10)).toBe(157);
  });

  it("no otorga puntos con montos o tasas inválidas", () => {
    expect(pointsForDonation(0, 10)).toBe(0);
    expect(pointsForDonation(-50, 10)).toBe(0);
    expect(pointsForDonation(Number.NaN, 10)).toBe(0);
    expect(pointsForDonation(100, 0)).toBe(0);
  });
});

describe("canAfford", () => {
  it("permite canjear con saldo suficiente", () => {
    expect(canAfford(500, 500)).toBe(true);
    expect(canAfford(499, 500)).toBe(false);
  });
});

describe("levelFor", () => {
  it("empieza en el primer nivel", () => {
    const { current, next } = levelFor(0);
    expect(current.name).toBe(LEVELS[0].name);
    expect(next?.name).toBe(LEVELS[1].name);
  });

  it("calcula el progreso hacia el siguiente nivel", () => {
    const { current, progress } = levelFor(1250);
    expect(current.name).toBe("Brote");
    expect(progress).toBeCloseTo(0.5);
  });

  it("el último nivel tiene progreso completo", () => {
    const { current, next, progress } = levelFor(1_000_000);
    expect(current.name).toBe(LEVELS.at(-1)!.name);
    expect(next).toBeNull();
    expect(progress).toBe(1);
  });
});
