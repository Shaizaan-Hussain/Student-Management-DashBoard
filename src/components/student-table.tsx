"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { Student } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (regNo: string) => void;
  onAcceptFix: (regNo: string, field: string, suggestedFix: string) => void;
  onIgnoreFix: (regNo: string, field: string) => void;
}

const AnomalyCell = ({ student, field, value, onAcceptFix, onIgnoreFix }: { student: Student; field: keyof Student; value: string; onAcceptFix: StudentTableProps['onAcceptFix']; onIgnoreFix: StudentTableProps['onIgnoreFix'] }) => {
    const anomaly = student.anomalies?.find(a => a.field === field && a.isAnomalous);

    if (!anomaly || !anomaly.suggestedFix) {
        return <>{value}</>;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer rounded-md bg-yellow-100 dark:bg-yellow-900/30 p-1 -m-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                    <span className="truncate">{value}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Data Quality Suggestion</h4>
                        <p className="text-sm text-muted-foreground">
                            AI has flagged this field as a potential anomaly.
                        </p>
                    </div>
                    <div className="grid gap-2 text-sm">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold">Current:</span>
                            <span className="col-span-2 truncate">{value}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-semibold">Suggested:</span>
                            <span className="col-span-2 text-green-600 dark:text-green-400 font-medium truncate">{anomaly.suggestedFix}</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => onIgnoreFix(student.RegNo, field)}>
                            <XCircle className="mr-2 h-4 w-4" /> Ignore
                        </Button>
                        <Button variant="default" size="sm" onClick={() => onAcceptFix(student.RegNo, field, anomaly.suggestedFix!)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Accept
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};


export function StudentTable({ students, onEdit, onDelete, onAcceptFix, onIgnoreFix }: StudentTableProps) {
  if (students.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-lg font-semibold">No Students Found</h3>
            <p>Add a new student to get started.</p>
        </div>
    )
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Marks</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.RegNo}>
              <TableCell className="font-medium">{student.RegNo}</TableCell>
              <TableCell>
                <AnomalyCell student={student} field="Name" value={student.Name} onAcceptFix={onAcceptFix} onIgnoreFix={onIgnoreFix} />
              </TableCell>
              <TableCell>
                 <AnomalyCell student={student} field="Dept" value={student.Dept} onAcceptFix={onAcceptFix} onIgnoreFix={onIgnoreFix} />
              </TableCell>
              <TableCell>{student.Year}</TableCell>
              <TableCell className="text-right">{student.Marks}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(student)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(student.RegNo)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
