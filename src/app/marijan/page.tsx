import { CreatorFrame } from "../../components/CreatorFrame";
import MarijanCreator from "../../features/marijan/MarijanCreator";
export const metadata = { title: "Marijan Mode · WFRP Character Ledger" };
export const viewport = { themeColor: "#18181b" };
export default function MarijanPage() {
  return (
    <CreatorFrame mode="marijan">
      <MarijanCreator />
    </CreatorFrame>
  );
}
