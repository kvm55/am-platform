export default function Footer() {
  return (
    <footer className="bg-teal text-beige py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-greenery font-bold">Propwell</span>
          <span className="text-sm">Asset Management Platform</span>
        </div>
        <p className="text-sm text-beige/70">&copy; {new Date().getFullYear()} The Upland Group. All rights reserved.</p>
      </div>
    </footer>
  );
}
