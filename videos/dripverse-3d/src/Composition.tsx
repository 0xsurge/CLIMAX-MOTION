import { Composition } from "remotion";
import { Shot } from "./Shot";

export const MyComposition = () => {
  return <Composition id="Drip3D" component={Shot} durationInFrames={360} fps={60} width={1920} height={1080} />;
};
