import { PRODUCERS } from "./TextProducers";

it("does not repeat prosigns", () => {
  var pattern = [
    {
      producer: "repeats",
      size: 2
    },
    {
      producer: "prosign",
      size: 1
    }
  ];
  var p = PRODUCERS["prosign"](1, pattern.slice(1), 2, 1);
  expect(p).toBeNull();
});
