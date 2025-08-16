"use client";

import { useEffect } from "react";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@documenso/ui/primitives/button";

export type VerifyEmailClientProps = {
  signInData?: string;
};

export const VerifyEmailClientPage = ({
  signInData,
}: VerifyEmailClientProps) => {};
