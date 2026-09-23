import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { createCoachToken, verifyCoachCredentials } from "./coachAuth";
import { getStoredContent, listAttendanceHistory, listStudents, lookupStudent, markAttendance, saveStoredContent, saveStudent } from "./db";

const DEFAULT_CONTENT = {
  academyName: "The Cobra Karate Academy", tagline: "Never quit...it's your turn", eyebrow: "THE COBRA STANDARD", headline: "DISCIPLINE. POWER. PRECISION.", intro: "A modern martial arts academy built around quiet confidence, technical excellence, and the work no one sees.", story: "Your academy story belongs here. Add the origin, philosophy, and community you want future students to understand.", mission: "Build disciplined people through a practice that rewards patience, presence, and precision.", coachName: "Coach profile pending", coachBio: "Add the coach’s name, qualifications, and teaching philosophy from the admin dashboard.",
  stats: [{ value: "—", label: "Years in motion" }, { value: "—", label: "Active students" }, { value: "—", label: "Podiums earned" }],
  training: [{ title: "Karate", description: "Build a technical foundation through stance, movement, strikes, and control." }, { title: "Kumite", description: "Develop timing, distance, composure, and the intelligence to read a moment." }, { title: "Kata", description: "Sharpen form, rhythm, breath, and the invisible details that create mastery." }, { title: "Self Defence", description: "Learn practical awareness and decisive fundamentals for real-world confidence." }, { title: "Fitness & Conditioning", description: "Train the engine behind the technique with mobility, power, and repeatable effort." }],
  achievements: [{ year: "—", title: "Add your first achievement", description: "Coach-managed wins, milestones, and moments worth remembering." }, { year: "—", title: "A standard worth sharing", description: "Replace this placeholder with a real student or academy milestone." }],
  gallery: [{ src: "/manus-storage/japanese-dojo_d40943e5.jpg", alt: "Japanese dojo interior", label: "Enter the dojo" }, { src: "/manus-storage/japanese-karate_a4a28657.webp", alt: "Karate athlete in a traditional dojo", label: "The form" }, { src: "/manus-storage/kata-practice_adf6877b.jpg", alt: "Athlete practicing a kata sequence", label: "Form in motion" }, { src: "/manus-storage/dojo-space_e988f290.jpg", alt: "Modern martial arts training space", label: "Built for the work" }],
  announcements: [{ date: "UPDATE", title: "Announcements will appear here", description: "Use the coach dashboard to publish schedules, events, and academy news." }],
  contact: { phone: "Add phone number", whatsapp: "Add WhatsApp number", email: "Add academy email", address: "Add academy address", maps: "#" }, social: { instagram: "#", facebook: "#", youtube: "#", whatsapp: "#", telegram: "#" }, footer: "Training is the promise you keep to yourself.",
};

const adminOnly = adminProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin" && !ctx.isCoach) throw new TRPCError({ code: "FORBIDDEN", message: "Coach access required." });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    coachSession: publicProcedure.query(opts => opts.ctx.isCoach),
    coachLogin: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      if (!verifyCoachCredentials(input.username, input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid coach credentials." });
      const token = await createCoachToken();
      ctx.res.cookie("coach_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 8 * 60 * 60 * 1000, path: "/" });
      return { success: true } as const;
    }),
    coachLogout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie("coach_session", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" }); return { success: true } as const; }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  content: router({
    get: publicProcedure.query(async () => { const stored = await getStoredContent(); if (!stored) return DEFAULT_CONTENT; try { return { ...DEFAULT_CONTENT, ...JSON.parse(stored.payload) }; } catch { return DEFAULT_CONTENT; } }),
    update: adminOnly.input(z.object({ payload: z.record(z.string(), z.unknown()) })).mutation(async ({ input }) => { await saveStoredContent(JSON.stringify(input.payload)); return { success: true } as const; }),
  }),
  attendance: router({
    lookup: publicProcedure.input(z.object({ studentId: z.string().trim().min(1).max(64) })).mutation(async ({ input }) => { const result = await lookupStudent(input.studentId); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "No active student record found for that ID." }); return result; }),
    listStudents: adminOnly.query(() => listStudents()),
    history: adminOnly.query(() => listAttendanceHistory()),
    saveStudent: adminOnly.input(z.object({ studentId: z.string().trim().min(1).max(64), name: z.string().trim().min(1), belt: z.string().trim().min(1), enabled: z.number().int().min(0).max(1).default(1) })).mutation(async ({ input }) => { await saveStudent(input); return { success: true } as const; }),
    mark: adminOnly.input(z.object({ studentId: z.string().trim().min(1).max(64), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), status: z.enum(["present", "absent", "late"]) })).mutation(async ({ input }) => { await markAttendance(input); return { success: true } as const; }),
  }),
});

export type AppRouter = typeof appRouter;
