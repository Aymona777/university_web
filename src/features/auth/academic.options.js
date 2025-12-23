export const FACULTIES = [
  { id: 1, name: "Computer Science", years: 4 },
  { id: 2, name: "Engineering", years: 5 },
  { id: 3, name: "Business Administration", years: 4 },
  { id: 4, name: "Medicine", years: 6 },
  { id: 5, name: "Law", years: 4 },
];

export const DEPARTMENTS = [
  { id: 1, facultyId: 1, name: "Software Engineering" },
  { id: 2, facultyId: 1, name: "Artificial Intelligence" },
  { id: 3, facultyId: 1, name: "Cybersecurity" },
  { id: 4, facultyId: 1, name: "Data Science" },

  { id: 5, facultyId: 2, name: "Mechanical Engineering" },
  { id: 6, facultyId: 2, name: "Electrical Engineering" },
  { id: 7, facultyId: 2, name: "Civil Engineering" },
  { id: 8, facultyId: 2, name: "Chemical Engineering" },

  { id: 9, facultyId: 3, name: "Marketing" },
  { id: 10, facultyId: 3, name: "Finance" },
  { id: 11, facultyId: 3, name: "Human Resources" },
  { id: 12, facultyId: 3, name: "Management" },

  { id: 13, facultyId: 4, name: "General Medicine" },
  { id: 14, facultyId: 4, name: "Surgery" },
  { id: 15, facultyId: 4, name: "Pediatrics" },
  { id: 16, facultyId: 4, name: "Cardiology" },

  { id: 17, facultyId: 5, name: "Criminal Law" },
  { id: 18, facultyId: 5, name: "Civil Law" },
  { id: 19, facultyId: 5, name: "International Law" },
  { id: 20, facultyId: 5, name: "Corporate Law" },
];

export function getDepartmentsForFaculty(facultyId) {
  return DEPARTMENTS.filter((d) => d.facultyId === Number(facultyId));
}

export function getYearsForFaculty(facultyId) {
  const f = FACULTIES.find((x) => x.id === Number(facultyId));
  const count = f?.years ?? 4;
  return Array.from({ length: count }, (_, i) => i + 1);
}
