"use client";

import { useRouter } from "next/navigation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@documenso/ui/primitives/form/form";
import { cn } from "@documenso/ui/lib/utils";
import { PasswordInput } from "@documenso/ui/primitives/password-input";
import { toast } from "@documenso/ui/primitives/use-toaste";
import { ZPasswordSchema } from "@documenso/trpc/server/auth-router/schema";
import { Button } from "@documenso/ui/primitives/button";

const ZResetPasswordSchema = z
  .object({
    password: ZPasswordSchema,
    repeatedPassword: ZPasswordSchema,
  })
  .refine((data) => data.password === data.repeatedPassword, {
    path: ["repeatedPassword"],
    message: "Passwords don't match",
  });

type TResetPasswordSchema = z.infer<typeof ZResetPasswordSchema>;

type ResetPasswordFormProps = {
  className?: string;
  token: string;
};

export const ResetPasswordForm = async ({
  className,
  token,
}: ResetPasswordFormProps) => {
  const form = useForm<TResetPasswordSchema>({
    values: {
      password: "",
      repeatedPassword: "",
    },
    resolver: zodResolver(ZResetPasswordSchema),
  });

  const isSubmitting = form.formState.isSubmitting;
  const router = useRouter();

  const onFormSubmit = async ({
    password,
  }: Omit<TResetPasswordSchema, "repeatedPassword">) => {
    console.log("Form is submitting...");
  };

  return (
    <Form {...form}>
      <form
        className={cn(className, "flex flex-col w-full gap-y-4")}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset
          className="flex flex-col w-full gap-y-4"
          disabled={isSubmitting}
        >
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="repeatedPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? " Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
};
