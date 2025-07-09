"use client";

import { useState, useEffect, useCallback } from "react";
import type { Student, StudentFormValues } from "@/lib/types";

const STORAGE_KEY = "studentData";

const getInitialData = (): Student[] => {
    // This is some sample data to get started.
    // In a real app, you might start with an empty array.
    return [
        { RegNo: 'S001', Name: 'Alice Johnson', Dept: 'Computer Science', Year: '2', Marks: '88' },
        { RegNo: 'S002', Name: 'Bob Smith', Dept: 'Mechanical Engineering', Year: '3', Marks: '75' },
        { RegNo: 'S003', Name: 'Charlie Brown', Dept: 'Electrical Engineering', Year: '1', Marks: '92' },
        { RegNo: 'S004', Name: 'Diana Prince', Dept: 'Civil Engineering', Year: '4', Marks: '85' },
        { RegNo: 'S005', Name: 'Com uter Science', Dept: 'Computer Science', Year: '2', Marks: '79' },
    ];
};

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setStudents(JSON.parse(storedData));
      } else {
        // Load initial data if nothing is in localStorage
        const initialData = getInitialData();
        setStudents(initialData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Fallback to initial data if localStorage is not available
      setStudents(getInitialData());
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!isLoading){
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    }
  }, [students, isLoading]);

  const addStudent = useCallback((studentData: StudentFormValues) => {
    const newStudent: Student = { ...studentData };
    setStudents(prev => {
        if(prev.some(s => s.RegNo === newStudent.RegNo)){
            // In a real app, you might want to throw an error here or show a toast
            alert('A student with this Registration Number already exists.');
            return prev;
        }
        return [...prev, newStudent]
    });
  }, []);

  const updateStudent = useCallback((regNo: string, updatedData: Partial<Student>) => {
    setStudents(prev =>
      prev.map(student =>
        student.RegNo === regNo ? { ...student, ...updatedData } : student
      )
    );
  }, []);

  const deleteStudent = useCallback((regNo: string) => {
    setStudents(prev => prev.filter(student => student.RegNo !== regNo));
  }, []);
  
  const handleSetStudents = useCallback((newStudents: Student[]) => {
    setStudents(newStudents);
  }, []);

  return { students, setStudents: handleSetStudents, addStudent, updateStudent, deleteStudent, isLoading };
};
