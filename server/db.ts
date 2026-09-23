import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { attendanceRecords, InsertUser, siteContent, students, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function getStoredContent() { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(siteContent).where(eq(siteContent.contentKey, "global")).limit(1); return result[0]; }
export async function saveStoredContent(payload: string) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.insert(siteContent).values({ contentKey: "global", payload }).onDuplicateKeyUpdate({ set: { payload } }); }
export async function listStudents() { const db = await getDb(); if (!db) return []; return db.select().from(students).where(eq(students.enabled, 1)).orderBy(students.name); }
export async function saveStudent(input: { studentId: string; name: string; belt: string; enabled?: number }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.insert(students).values({ studentId: input.studentId, name: input.name, belt: input.belt, enabled: input.enabled ?? 1 }).onDuplicateKeyUpdate({ set: { name: input.name, belt: input.belt, enabled: input.enabled ?? 1 } }); }
export async function lookupStudent(studentId: string) { const db = await getDb(); if (!db) return undefined; const student = await db.select().from(students).where(and(eq(students.studentId, studentId), eq(students.enabled, 1))).limit(1); if (!student[0]) return undefined; const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId)).orderBy(desc(attendanceRecords.date)); const total = records.length; const attended = records.filter(record => record.status === "present" || record.status === "late").length; return { student: student[0], records, attendancePercentage: total ? Math.round((attended / total) * 100) : null }; }
export async function markAttendance(input: { studentId: string; date: string; status: "present" | "absent" | "late" }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); await db.insert(attendanceRecords).values(input).onDuplicateKeyUpdate({ set: { status: input.status } }); }
export async function listAttendanceHistory() {
  const db = await getDb(); if (!db) return [];
  const rows = await db.select({ studentId: attendanceRecords.studentId, date: attendanceRecords.date, status: attendanceRecords.status, studentName: students.name, belt: students.belt }).from(attendanceRecords).leftJoin(students, eq(attendanceRecords.studentId, students.studentId)).orderBy(desc(attendanceRecords.date), students.name);
  return rows;
}
