const calculadora = require("../../models/calculadora.js");

test("calculadora", () => {
  expect(calculadora.somar(1, 2)).toBe(3);
});
