import { SiteChrome } from "@/components/layout/SiteChrome";
import { StatusScreen } from "@/components/ui/StatusScreen";

export default function NotFound() {
  return (
    <SiteChrome>
      <StatusScreen variant="notFound" />
    </SiteChrome>
  );
}
