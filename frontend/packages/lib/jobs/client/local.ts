// import type { NextApiRequest, NextApiResponse } from "next";
// import { sha256 } from "@noble/hashes/sha256";
// import { json } from "micro";

// import { NEXT_PRIVATE_INTERNAL_WEBAPP_URL } from "../../constants/app";
// import { sign } from "../../server-only/crypto/sign";
// import { verify } from "../../server-only/crypto/verify";
// import type {
//   JobDefinition,
//   JobRunIO,
//   SimpleTriggerJobOptions,
//   ZSimpleTriggerJobOptionsSchema,
// } from "./_internal/job";
// import type { Json } from "./_internal/json";
// import { BaseJobProvider } from "./base";

// export class LocalJobProvider extends BaseJobProvider {
//   private static _instance: LocalJobProvider;
//   private _jobDefinitions: Record<string, JobDefinition> = {};

//   private constructor() {
//     super();
//   }

//   static getInstance() {
//     if (!this._instance) {
//       this._instance = new LocalJobProvider();
//     }
//     return this._instance;
//   }

//   public defineJob<N extends string, T = any>(
//     definition: JobDefinition<N, T>
//   ): void {
//     this._jobDefinitions[definition.id] = {
//       ...definition,
//       enabled: definition.enabled ?? true,
//     };
//   }

//   public async triggerJob(options:SimpleTriggerJobOptions){

//   }
// }
