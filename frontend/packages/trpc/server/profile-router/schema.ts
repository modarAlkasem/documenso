import { z } from "zod";

export const ZConfirmationEmailMutationSchema = z.object({
  email: z.string().email(),
});
