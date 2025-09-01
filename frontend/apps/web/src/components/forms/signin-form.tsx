"use client";

import { useState, useEffect, useMemo } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FaIdCardClip } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { match } from "ts-pattern";
import { z } from "zod";

import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import { ErrorCode, isErrorCode } from "@documenso/lib/next-auth/error-codes";
import { trpc } from "@documenso/trpc/react";
import { ZCurrentPasswordSchema } from "@documenso/trpc/server/auth-router/schema";
import { cn } from "@documenso/ui/lib/utils";
import { Button } from "@documenso/ui/primitives/button";
