"use client";

import { useState } from "react";
import type { QueryClientConfig } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";
import { getBaseUrl } from "@documenso/lib/universal/get-base-url";
import type { AppRouter } from "../server/router";
export { getQueryKey } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        if (opts.meta.doNotInvalidateQueryOnMutation) return;

        await opts.queryClient.invalidateQueries({
          predicate: (query) => !query?.meta?.doNotInvalidateQueryOnMutation,
        });
      },
    },
  },
});

export interface TRPCProviderProps {
  children: React.ReactNode;
  headers?: Record<string, string>;
}

export const TRPCProvider = ({ children, headers }: TRPCProviderProps) => {
  let queryClientConfig: QueryClientConfig | undefined;

  const isDeveloping =
    typeof window !== "undefined" &&
    !window.navigator.onLine &&
    window.location.hostname === "localhost";

  if (isDeveloping) {
    queryClientConfig = {
      defaultOptions: {
        queries: {
          networkMode: "always",
        },
        mutations: {
          networkMode: "always",
        },
      },
    };
  }

  const [queryClient] = useState(() => new QueryClient(queryClientConfig));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.context.skipBatch === true,
          true: httpLink({
            url: `${getBaseUrl()}/api/trpc`,
            headers,
            transformer: SuperJSON,
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            headers,
            transformer: SuperJSON,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
