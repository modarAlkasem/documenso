import type { Metadata } from "next";

import { getRequiredServerComponentSession } from "@documenso/lib/next-auth/get-server-session";

// export type DocumentsPageProps = {
//     searchP
// }

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const { user } = await getRequiredServerComponentSession();

  return (
    <div>
      <h1> Documents Page</h1>
    </div>
  );
}
