import {z} from "zod";
import type {NextApiRequest} from "next";
import type {RequestInternal} from "next-auth";

const ZIPSchema = z.string().ip();
const ZRequestMetadataSchema = z.object({
    ipAddress: ZIPSchema.optional(),
    userAgent: z.string().optional()
});

export type TRequestMetadata = z.infer< typeof ZRequestMetadataSchema>

export type ApiRequestMetadata = {
    requestMetadata:TRequestMetadata;
    source:'apiV1' | 'apiV2' | 'app';
    auth: "session" | "api" | null;
    auditUser?:{
        id:number | null;
        name: string | null;
        email: string | null;
    }
}

export const extractNextApiRequestMetadata = (req:NextApiRequest) : TRequestMetadata =>{
    const parsedIp = ZIPSchema.safeParse(req.headers['x-forwarded-for']|| req.socket.remoteAddress);
    const ipAddress = parsedIp.success ? parsedIp.data : undefined;
    const userAgent = req.headers["user-agent"];
    return {
        ipAddress:ipAddress,
        userAgent:userAgent
    } 
}