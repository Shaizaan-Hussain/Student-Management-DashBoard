"use client";

import * as React from "react";
import {
  PlusCircle,
  Search,
  Loader2,
  AlertTriangle,
  BookUser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/use-students";
import type { Student, StudentFormValues } from "@/lib/types";
import { StudentForm } from "@/components/student-form";
import { StudentTable } from "@/components/student-table";
import { flagAndFixAnomalousData } from "@/ai/flows/flag-and-fix-anomalous-data";

export default function Home() {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    setStudents,
    isLoading,
  } = useStudents();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [deletingStudentRegNo, setDeletingStudentRegNo] = React.useState<string | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = React.useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (regNo: string) => {
    setDeletingStudentRegNo(regNo);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (deletingStudentRegNo) {
      deleteStudent(deletingStudentRegNo);
      toast({
        title: "Success",
        description: "Student record deleted successfully.",
        variant: "default",
      });
    }
    setIsDeleteAlertOpen(false);
    setDeletingStudentRegNo(null);
  };

  const handleFormSubmit = (values: StudentFormValues) => {
    if (editingStudent) {
      updateStudent(editingStudent.RegNo, { ...editingStudent, ...values });
      toast({
        title: "Success",
        description: "Student record updated successfully.",
      });
    } else {
      addStudent(values);
      toast({
        title: "Success",
        description: "Student record added successfully.",
      });
    }
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  const handleCheckQuality = async () => {
    setIsCheckingQuality(true);
    try {
      const currentStudents = students.map(({ anomalies, ...rest }) => rest);
      const flaggedData = await flagAndFixAnomalousData(currentStudents);
      setStudents(flaggedData);
      toast({
        title: "Data Quality Check Complete",
        description: "Anomalies have been flagged for your review.",
      });
    } catch (error) {
      console.error("Error checking data quality:", error);
      toast({
        title: "Error",
        description: "Failed to check data quality.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleAcceptFix = (regNo: string, field: string, suggestedFix: string) => {
    const student = students.find(s => s.RegNo === regNo);
    if (student) {
      const updatedStudent = {
        ...student,
        [field]: suggestedFix,
        anomalies: student.anomalies?.filter(a => a.field !== field),
      };
      updateStudent(regNo, updatedStudent);
       toast({
        title: "Record Updated",
        description: `Field '${field}' has been updated.`,
      });
    }
  };

  const handleIgnoreFix = (regNo: string, field: string) => {
     const student = students.find(s => s.RegNo === regNo);
     if (student) {
        const updatedStudent = {
            ...student,
            anomalies: student.anomalies?.filter(a => a.field !== field),
        };
        updateStudent(regNo, updatedStudent);
        toast({
            title: "Suggestion Ignored",
            description: `Anomaly flag for '${field}' has been removed.`,
        });
     }
  };


  const filteredStudents = students.filter(
    (student) =>
      student.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.RegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.Dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.Year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookUser className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Student Manager Lite</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Student Records</CardTitle>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleCheckQuality} disabled={isCheckingQuality}>
                  {isCheckingQuality ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  Check Quality
                </Button>
                <Button onClick={handleAdd}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
              <StudentTable
                students={filteredStudents}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onAcceptFix={handleAcceptFix}
                onIgnoreFix={handleIgnoreFix}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update the student's details."
                : "Enter the new student's details."}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            onSubmit={handleFormSubmit}
            initialData={editingStudent}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
