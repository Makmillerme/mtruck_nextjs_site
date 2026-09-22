import { LoadingAdminTable } from "./loading-skeletons";

/** @deprecated Prefer LoadingAdminTable — kept for existing imports. */
function LoadingTable({ rows = 5 }: { rows?: number }) {
  return <LoadingAdminTable rows={rows} />;
}

export default LoadingTable;
