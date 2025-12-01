export default function Footer() {
  return (
    <footer className="border-t py-6 mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} AcademOra. All rights reserved.
      </div>
    </footer>
  )
}
