// src/ai/flows/flag-and-fix-anomalous-data.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to flag and fix anomalous data in student records.
 *
 * It identifies potential anomalies in text fields (e.g., names, departments) and suggests corrections.
 *
 * @interface FlagAndFixAnomalousDataInput - Defines the input schema for the flow, which is a list of student records.
 * @interface FlagAndFixAnomalousDataOutput - Defines the output schema for the flow, which is a list of student records with anomaly flags and suggestions.
 * @function flagAndFixAnomalousData - The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudentRecordSchema = z.object({
  Name: z.string().describe('Student name'),
  RegNo: z.string().describe('Registration number'),
  Dept: z.string().describe('Department'),
  Year: z.string().describe('Year of study'),
  Marks: z.string().describe('Marks obtained'),
});

export type StudentRecord = z.infer<typeof StudentRecordSchema>;

const FlaggedStudentRecordSchema = StudentRecordSchema.extend({
  anomalies: z
    .array(
      z.object({
        field: z.string(),
        isAnomalous: z.boolean(),
        suggestedFix: z.string().optional(),
      })
    )
    .optional()
    .describe('Anomaly flags and suggestions for each field'),
});

export type FlaggedStudentRecord = z.infer<typeof FlaggedStudentRecordSchema>;

const FlagAndFixAnomalousDataInputSchema = z.array(StudentRecordSchema).describe('List of student records');
export type FlagAndFixAnomalousDataInput = z.infer<typeof FlagAndFixAnomalousDataInputSchema>;

const FlagAndFixAnomalousDataOutputSchema = z.array(FlaggedStudentRecordSchema).describe('List of student records with anomaly flags and suggestions');
export type FlagAndFixAnomalousDataOutput = z.infer<typeof FlagAndFixAnomalousDataOutputSchema>;

export async function flagAndFixAnomalousData(input: FlagAndFixAnomalousDataInput): Promise<FlagAndFixAnomalousDataOutput> {
  return flagAndFixAnomalousDataFlow(input);
}

const flagAndFixAnomalousDataPrompt = ai.definePrompt({
  name: 'flagAndFixAnomalousDataPrompt',
  input: {schema: FlagAndFixAnomalousDataInputSchema},
  output: {schema: FlagAndFixAnomalousDataOutputSchema},
  prompt: `You are a data quality expert. You are given a list of student records.

      For each student record, analyze the 'Name' and 'Dept' fields to identify potential anomalies.
      Anomalies are defined as values that share a lot of character sequences (long or repeated) with the other values in the column.

      For each field in each record, determine if it is anomalous and set the 'isAnomalous' flag accordingly.

      If a field is anomalous, suggest a possible correction in the 'suggestedFix' field.  If a field is not anomalous, do not populate the 'suggestedFix' field.

      Return the list of student records with the anomaly flags and suggestions.

      Here are the student records:
      {{#each this}}
      Record:
        Name: {{this.Name}}
        RegNo: {{this.RegNo}}
        Dept: {{this.Dept}}
        Year: {{this.Year}}
        Marks: {{this.Marks}}
      {{/each}}`,
});

const flagAndFixAnomalousDataFlow = ai.defineFlow(
  {
    name: 'flagAndFixAnomalousDataFlow',
    inputSchema: FlagAndFixAnomalousDataInputSchema,
    outputSchema: FlagAndFixAnomalousDataOutputSchema,
  },
  async input => {
    const {output} = await flagAndFixAnomalousDataPrompt(input);
    return output!;
  }
);
