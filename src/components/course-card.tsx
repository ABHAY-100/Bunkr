"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  course: any
  onClick: () => void
  isSelected: boolean
}

export function CourseCard({ course, onClick, isSelected }: CourseCardProps) {
  // This is a placeholder since we don't have actual attendance data per course
  // In a real implementation, you would use the actual data
  const attendancePercentage = Math.floor(Math.random() * 30) + 70 // Random between 70-100%

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={cn("cursor-pointer overflow-hidden transition-all", isSelected && "ring-2 ring-primary")}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline">{course.code}</Badge>
            </div>
          </div>
          <CardTitle className="line-clamp-1 text-lg mt-2">{course.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {course.academic_year} • {course.academic_semester} semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Attendance</span>
            <span className="text-sm font-medium">{attendancePercentage}%</span>
          </div>
          <Progress value={attendancePercentage} className="h-2" />
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
            <span>ID: {course.id}</span>
            <span>{course.start_year ? `${course.start_year}-${course.end_year}` : "Ongoing"}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
