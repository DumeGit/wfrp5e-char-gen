import { CreatorFrame } from "../components/CreatorFrame";
import PlayerCreator from "../features/player/PlayerCreator";
export default function PlayerPage() {
  return (
    <CreatorFrame mode="player">
      <PlayerCreator />
    </CreatorFrame>
  );
}
