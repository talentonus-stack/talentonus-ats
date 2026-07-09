sed -i 's/  return (/  return (\n    <div className="max-w-4xl animate-fade-in mx-auto">\n      <h1 className="mb-8 text-3xl font-bold tracking-tight text-light">Edit Job<\/h1>\n      <JobFormClient companies={companies} createJob={updateJob} initialData={job} \/>\n    <\/div>\n  )\n}\n\/\*/g' src/app/jobs/\[id\]/edit/page.tsx
sed -i 's/^}$/}\n\*\//g' src/app/jobs/\[id\]/edit/page.tsx
