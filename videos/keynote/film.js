// film.js: wires the scene modules. window.seek(t) is async and a pure function of t (no state between frames).
let BUILT = false, S1, S2, S3, S4;
window.seek = async function (t) {
  if (!BUILT) { S1 = buildS1(); S2 = buildS2(); S3 = buildS3(); S4 = buildS4(); BUILT = true; }
  const cam = camera(t); applyCamera(cam);
  S1(t); S2(t); S3(t); S4(t);
  updateCursor(t, cam);
  await settleGlass();      // new glass displacement maps decode asynchronously: wait before the frame is read
};
