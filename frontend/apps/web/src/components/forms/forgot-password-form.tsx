"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@documenso/ui/primitives/input";
import { Button } from "@documenso/ui/primitives/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@documenso/ui/primitives/form/form";
import { toast } from "@documenso/ui/primitives/use-toaste";
import { cn } from "@documenso/ui/lib/utils";
import { trpc } from "@documenso/trpc/react";

const ZForgotPasswordSchema = z.object({
  email: z.string().email(),
});

type TForgotPasswordSchema = z.infer<typeof ZForgotPasswordSchema>;

type ForgotPasswordProps = {
  className?: string;
};
export const ForgotPasswordForm = ({ className }: ForgotPasswordProps) => {
  const form = useForm<TForgotPasswordSchema>({
    values: {
      email: "",
    },
    resolver: zodResolver(ZForgotPasswordSchema),
  });
  const router = useRouter();
  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: forgotPassword } =
    trpc.profile.forgotPassword.useMutation();

  const onFormSubmit = async ({ email }: TForgotPasswordSchema) => {
    await forgotPassword({ email }).catch((err) => null);

    toast({
      title: "Password Reset Email Sent",
      description:
        "A password reset email has been sent, If you have an account you should see it in your inbox shortly.",
      duration: 5000,
    });
    form.reset();
    router.push("/check-email");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className={cn("w-full flex flex-col gap-y-4", className)}
      >
        <fieldset
          className="flex flex-col w-full gap-y-4"
          disabled={isSubmitting}
        >
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <Button size="lg" loading={isSubmitting}>
          {isSubmitting ? "Sending Reset Email..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};
