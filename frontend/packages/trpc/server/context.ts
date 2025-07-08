import {z} from "zod";
import type {ApiRequestMetadata} from "@documenso/lib/universal/extract-request-metadata";
import {extractNextApiRequestMetadata} from "@documenso/lib/universal/extract-request-metadata";

import type { CreateNextContextOptions } from "./adapters/next";

type CreateTrpcContext = CreateNextContextOptions & {
    requestSource : 'apiV1' | 'apiV2' | 'app';
}

export const createTrpcContext = ({
    req,
    res,
    requestSource
}:Omit<CreateTrpcContext,"info">) =>{
    const metadata:ApiRequestMetadata = {
        requestMetadata:extractNextApiRequestMetadata(req),
        source:requestSource,
        auth:null
    }
    const teamId = z.coerce.number().optional().catch(()=>undefined).parse(req.headers["x-team-id"]);

    return {
        req,
        metadata,
        teamId
    }
}

export type TrpcContext= ReturnType<typeof createTrpcContext>