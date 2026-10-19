import { CreatorFrame } from "../../components/CreatorFrame";
import ManagerEntry from "../../features/manager/Manager";
export const metadata = { title: "Character Manager · WFRP Character Ledger" };
export const viewport = { themeColor: "#252d21" };
export default function ManagerPage() {
  return (
    <CreatorFrame mode="manager">
      <ManagerEntry />
    </CreatorFrame>
  );
}
