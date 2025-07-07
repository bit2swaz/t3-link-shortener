import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "~/lib/password";
import { db } from "~/server/db";

// This route is obsolete. Authentication has been removed.
export {};
