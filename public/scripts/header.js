// new FinisherHeader({
//   count: 12,
//   size: {
//     min: 1018,
//     max: 1295,
//     pulse: 0,
//   },
//   speed: {
//     x: {
//       min: 0.6,
//       max: 1.7,
//     },
//     y: {
//       min: 0.6,
//       max: 1.7,
//     },
//   },
//   colors: {
//     background: "#7130b0",
//     particles: ["#ff681c", "#d19930", "#df1010"],
//   },
//   blending: "lighten",
//   opacity: {
//     center: 0.3,
//     edge: 0,
//   },
//   skew: -2,
//   shapes: ["c"],
// });

new FinisherHeader({
  count: 60,
  size: {
    min: 1,
    max: 13,
    pulse: 0,
  },
  speed: {
    x: {
      min: 0,
      max: 0.1,
    },
    y: {
      min: 0,
      max: 0.05,
    },
  },
  colors: {
    background: "#151515",
    particles: ["#ffffff"],
  },
  blending: "screen",
  opacity: {
    center: 0.45,
    edge: 0.6,
  },
  skew: -2,
  shapes: ["c", "s", "t"],
});
