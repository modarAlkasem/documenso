import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import {
  AppError,
  genericErrorCodeToTrpcErrorCodeMap,
} from "@documenso/lib/errors/app-error";
import type { AnyZodObject } from "zod";
import type { TrpcContext } from "./context";

type OpenApiMeta = {
  openapi?: {
    enabled?: boolean;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: `/${string}`;
    summary?: string;
    description?: string;
    protect?: boolean;
    tags?: string[];
    contentTypes?: (
      | "application/json"
      | "application/x-www-form-urlencoded"
      | (string & {})
    )[];
    deprecated?: boolean;
    requestHeaders?: AnyZodObject;
    responseHeaders?: AnyZodObject;
    successDescription?: string;
    errorResponses?: number[] | Record<number, string>;
  };
} & Record<string, unknown>;

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<TrpcContext>()
  .create({
    transformer: SuperJSON,
    errorFormatter: (opts) => {
      const { error, shape } = opts;
      const originalError = error.cause;
      let data: Record<string, unknown> = shape.data;
      if (originalError instanceof AppError) {
        data = {
          ...data,
          appError: AppError.toJSON(originalError),
          httpStatus:
            originalError.statusCode ??
            genericErrorCodeToTrpcErrorCodeMap[originalError.code]?.status ??
            400,
        };
      }
      return {
        ...shape,
        data,
      };
    },
  });

export const router = t.router;
export const procedure = t.procedure;
