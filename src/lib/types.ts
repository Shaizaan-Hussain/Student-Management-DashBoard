import { z } from "zod";

export const StudentFormSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  RegNo: z.string().min(1, 'Registration number is required'),
  Dept: z.string().min(1, 'Department is required'),
  Year: z.string().min(1, 'Year is required'),
  Marks: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
    message: "Marks must be a number between 0 and 100.",
  }),
});

export const StudentRecordSchema = StudentFormSchema.extend({
    // Fields from form schema are inherited
});

export const FlaggedStudentRecordSchema = StudentRecordSchema.extend({
  anomalies: z
    .array(
      z.object({
        field: z.string(),
        isAnomalous: z.boolean(),
        suggestedFix: z.string().optional(),
      })
    )
    .optional(),
});

export type Student = z.infer<typeof FlaggedStudentRecordSchema>;
export type StudentFormValues = z.infer<typeof StudentFormSchema>;
