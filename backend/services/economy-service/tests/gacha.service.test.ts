import { describe, expect, it } from "vitest";
import { pickWeightedReward } from "../src/modules/gacha/gacha.service.js";
import { scoreToCoins } from "../src/modules/rewards/rewards.service.js";

describe("economy-service · gacha", () => {
  it("elige un premio según los pesos (determinista con random fijo)", () => {
    const rewards = [{ weight: 50 }, { weight: 30 }, { weight: 20 }];
    expect(pickWeightedReward(rewards, 0)).toBe(0);
    expect(pickWeightedReward(rewards, 0.49)).toBe(0);
    expect(pickWeightedReward(rewards, 0.5)).toBe(1);
    expect(pickWeightedReward(rewards, 0.79)).toBe(1);
    expect(pickWeightedReward(rewards, 0.8)).toBe(2);
    expect(pickWeightedReward(rewards, 0.999)).toBe(2);
  });

  it("devuelve undefined si no hay premios con peso", () => {
    expect(pickWeightedReward([], 0.5)).toBeUndefined();
    expect(pickWeightedReward([{ weight: 0 }], 0.5)).toBeUndefined();
  });
});

describe("economy-service · rewards", () => {
  it("convierte puntaje a monedas con tope de 500", () => {
    expect(scoreToCoins(0)).toBe(0);
    expect(scoreToCoins(95)).toBe(9);
    expect(scoreToCoins(10_000)).toBe(500);
  });
});
