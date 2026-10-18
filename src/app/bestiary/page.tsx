import { CreatorFrame } from "../../components/CreatorFrame";
import BestiaryCreator from "../../features/bestiary/BestiaryCreator";
export const metadata = { title: "WFRP Bestiary Workshop" };
export const viewport = { themeColor: "#122136" };
export default function BestiaryPage() {
  return (
    <CreatorFrame mode="gm">
      <BestiaryCreator />
    </CreatorFrame>
  );
}
