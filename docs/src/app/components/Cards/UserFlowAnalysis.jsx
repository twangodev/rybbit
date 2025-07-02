import { Card } from "./Card";

export function UserFlowAnalysis() {
  return (
    <Card 
      title="User Flow Analysis" 
      description="Visualize how users navigate through your site with intuitive path analysis tools."
    >
      
      <div className="mt-4 bg-neutral-900 p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <div className="text-base font-medium">Homepage Flow</div>
          <div className="bg-blue-900/30 text-blue-400 text-sm px-2 py-1 rounded-md">
            1,240 users
          </div>
        </div>
        
        {/* Flow diagram - structured approach */}
        <div className="relative py-2">
          {/* Entry point - full width, no line */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Entry Page</span>
              <span className="text-xs text-neutral-400">100%</span>
            </div>
            <div className="w-full py-3 px-2 bg-emerald-900/30 border border-emerald-500/40 rounded-md text-center text-sm">
              Homepage
            </div>
          </div>
          
          {/* Second level - split */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Second Page</span>
              <span className="text-xs text-neutral-400">73% continued</span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-blue-900/30 border border-blue-500/40 rounded-md text-center text-sm mb-2">
                  Products
                </div>
                <div className="text-xs text-center text-blue-400">42%</div>
              </div>
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-blue-900/30 border border-blue-500/40 rounded-md text-center text-sm mb-2">
                  Features
                </div>
                <div className="text-xs text-center text-blue-400">31%</div>
              </div>
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-neutral-800 border border-neutral-700 rounded-md text-center text-neutral-500 text-sm mb-2">
                  Other
                </div>
                <div className="text-xs text-center text-neutral-500">27%</div>
              </div>
            </div>
          </div>
          
          {/* Third level - conversion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Conversion Pages</span>
              <span className="text-xs text-neutral-400">32% converted</span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-orange-900/30 border border-orange-500/40 rounded-md text-center text-sm mb-2">
                  Checkout
                </div>
                <div className="text-xs text-center text-orange-400">15%</div>
              </div>
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-orange-900/30 border border-orange-500/40 rounded-md text-center text-sm mb-2">
                  Sign Up
                </div>
                <div className="text-xs text-center text-orange-400">17%</div>
              </div>
              <div className="flex flex-col">
                <div className="py-3 px-2 bg-neutral-800 border border-neutral-700 rounded-md text-center text-neutral-500 text-sm mb-2">
                  Exit
                </div>
                <div className="text-xs text-center text-neutral-500">68%</div>
              </div>
            </div>
          </div>
          
          {/* Connecting lines using pseudo elements and CSS are better,
               but this simplified approach works for the mockup */}
          
          <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none hidden md:block" aria-hidden="true">
            {/* Connecting guides - would be better with SVG in a real implementation */}
            <div className="absolute top-14 left-16 h-[calc(100%-120px)] w-px bg-neutral-800"></div>
            <div className="absolute top-14 left-1/2 h-[calc(100%-120px)] w-px bg-neutral-800"></div>
            <div className="absolute top-14 right-16 h-[calc(100%-120px)] w-px bg-neutral-800"></div>
          </div>
        </div>
      </div>
    </Card>
  );
} 