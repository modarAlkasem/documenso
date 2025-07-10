import { createPagesRoute } from "@trigger.dev/nextjs";
import type { IO } from "@trigger.dev/sdk";
import { TriggerClient, eventTrigger } from "@trigger.dev/sdk";

import type {
  JobDefinition,
  JobRunIO,
  SimpleTriggerJobOptions,
} from "./_internal/job";
import { BaseJobProvider } from "./base";
import { TRIGGER_SECRET_KEY, TRIGGER_API_URL } from "../../constants/app";

export class TriggerJobProvider extends BaseJobProvider {
  private static _instance: TriggerJobProvider;
  private _client: TriggerClient;

  private constructor(options: { client: TriggerClient }) {
    super();
    this._client = options.client;
  }

  public static getInstance() {
    if (!this._instance) {
      const client = new TriggerClient({
        id: "documenso-app",
        apiKey: TRIGGER_SECRET_KEY(),
        apiUrl: TRIGGER_API_URL(),
      });
      this._instance = new TriggerJobProvider({ client: client });
    }
    return this._instance;
  }

  public defineJob<N extends string, T = any>(job: JobDefinition<N, T>): void {
    this._client.defineJob({
      id: job.id,
      name: job.name,
      version: job.version,
      trigger: eventTrigger({
        name: job.trigger.name,
        schema: job.trigger.schema,
      }),
      run: async (payload, io) =>
        job.handler({ payload, io: this.convertTriggerIoToJobRunIo(io) }),
    });
  }
  public async triggerJob(options: SimpleTriggerJobOptions): Promise<void> {
    await this._client.sendEvent({
      id: options.id,
      name: options.name,
      payload: options.payload,
      timestamp: options.timestamp ? new Date(options.timestamp) : undefined,
    });
  }

  public getApiHandler() {
    const { handler } = createPagesRoute(this._client);

    return handler;
  }

  private convertTriggerIoToJobRunIo(io: IO) {
    return {
      wait: io.wait,
      logger: io.logger,
      runTask: async (caheKey, callback) => io.runTask(caheKey, callback),
      triggerJob: async (cacheKey, payload) =>
        io.sendEvent(cacheKey, {
          ...payload,
          timestamp: payload.timestamp
            ? new Date(payload.timestamp)
            : undefined,
        }),
    } satisfies JobRunIO;
  }
}
