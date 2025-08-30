import { jobs } from "@documenso/lib/jobs/client";
import type { RequestHandler } from "inngest/next";

export const { GET, POST, PUT } =
  jobs.getRouteApiHandler() as unknown as RequestHandler & {
    GET: RequestHandler;
    POST: RequestHandler;
    PUT: RequestHandler;
  };
