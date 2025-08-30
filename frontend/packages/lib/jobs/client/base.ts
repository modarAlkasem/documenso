import type { NextApiRequest, NextApiResponse } from "next";

import type { JobDefinition, SimpleTriggerJobOptions } from "./_internal/job";
import type { RequestHandler } from "inngest/next";

export abstract class BaseJobProvider {
  public abstract triggerJob(_options: SimpleTriggerJobOptions): Promise<void>;

  public abstract defineJob<N extends string, T = any>(
    _job: JobDefinition<N, T>
  ): void;

  public abstract getApiHandler(): (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<Response | void>;

  public abstract getApiRouteHandlerMethods():
    | (RequestHandler & {
        GET: RequestHandler;
        POST: RequestHandler;
        PUT: RequestHandler;
      })
    | ((req: Request) => Promise<Response>);
}
