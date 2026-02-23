import AmpBoltIcon from "@/components/AmpBoltIcon";

export default function Footer() {
  return (
    <footer className="bg-teal text-beige py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AmpBoltIcon size={20} />
          <span className="text-beige font-bold">Propwell</span>
          <span className="text-greenery font-bold">AMP</span>
          <span className="text-sm ml-1">Asset Management Platform</span>
        </div>
        <p className="text-sm text-beige/70">&copy; {new Date().getFullYear()} The Upland Group. All rights reserved.</p>
      </div>
    </footer>
  );
}
