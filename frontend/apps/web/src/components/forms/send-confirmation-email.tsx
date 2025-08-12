"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@documenso/trpc/react";
import { cn } from "@documenso/ui/lib/utils";
import { Button } from "@documenso/ui/primitives/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@documenso/ui/primitives/form/form";
import { Input } from "@documenso/ui/primitives/input";
import { toast, useToast } from "@documenso/ui/primitives/use-toaste";

export const ZSendConfirmationEmailFormSchema = z.object({
  email: z.string().email(),
});

export type TSendConfirmationEmailFormSchema = z.infer<
  typeof ZSendConfirmationEmailFormSchema
>;

export type TSendConfirmationEmailFormProps = {
  className?: string;
};

export const SendConfirmationEmailForm = ({
  className,
}: TSendConfirmationEmailFormProps) => {
  const form = useForm<TSendConfirmationEmailFormSchema>({
    values: {
      email: "",
    },
    resolver: zodResolver(ZSendConfirmationEmailFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: sendConfirmationEmail } =
    trpc.profile.sendConfirmationEmail.useMutation();
  const onFormSubmit = async ({ email }: TSendConfirmationEmailFormSchema) => {
    try {
      await sendConfirmationEmail({
        email,
      });
      toast({
        title: "Confirmation email sent",
        description:
          "A confirmation email has been sent, and it should arrive in your inbox shortly.",
        duration: 5000,
      });
      form.reset();
    } catch (err) {
      toast({
        title: "An error occured while sending your confirmation email.",
        description:
          "Please try again and make sure you enter the correct email address.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("mt-6 flex w-full flex-col gap-y-4", className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset
          className="flex flex-col w-full gap-y-4"
          disabled={isSubmitting}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Email Address</FormLabel>
                <FormControl>
                  {" "}
                  <Input type="email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormMessage />
          <Button
            size="lg"
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Send confirmation email
          </Button>
        </fieldset>
      </form>
    </Form>
  );
};
