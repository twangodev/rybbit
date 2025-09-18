import { Card } from "./Card";

export function Funnels() {
  return (
    <Card 
      title="Funnels" 
      description="Visualize and analyze the path users take through your site to convert them."
    >
      
      <div className="mt-4 bg-neutral-900 p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <div className="text-base font-medium">Sign-up Funnel</div>
          <div className="bg-emerald-900/30 text-emerald-400 text-sm px-2 py-1 rounded-md">
            3.8% Conversion
          </div>
        </div>
        
        {/* Step 1 */}
        <div className="mb-6 relative">
          <div className="flex justify-between items-start mb-1">
            <div className="flex gap-2 items-center">
              <div className="h-6 w-6 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center text-xs">1</div>
              <span className="font-medium text-sm">Landing Page Visit</span>
            </div>
            <div className="text-sm text-neutral-300">5,274 users</div>
          </div>
          <div className="h-10 bg-blue-900/30 border border-blue-500/40 rounded-md w-full"></div>
          
          {/* Conversion arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-neutral-900 px-2 z-10 text-neutral-400 text-xs">
            21.2% →
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="mb-6 relative">
          <div className="flex justify-between items-start mb-1">
            <div className="flex gap-2 items-center">
              <div className="h-6 w-6 rounded-full bg-blue-900/50 border border-blue-500/50 flex items-center justify-center text-xs">2</div>
              <span className="font-medium text-sm">Sign-up Form View</span>
            </div>
            <div className="text-sm text-neutral-300">1,118 users</div>
          </div>
          <div className="h-10 bg-blue-900/30 border border-blue-500/40 rounded-md mx-auto" style={{ width: '75%' }}></div>
          
          {/* Conversion arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-neutral-900 px-2 z-10 text-neutral-400 text-xs">
            17.9% →
          </div>
        </div>
        
        {/* Step 3 */}
        <div>
          <div className="flex justify-between items-start mb-1">
            <div className="flex gap-2 items-center">
              <div className="h-6 w-6 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center text-xs">3</div>
              <span className="font-medium text-sm">Registration Complete</span>
            </div>
            <div className="text-sm text-neutral-300">200 users</div>
          </div>
          <div className="h-10 bg-emerald-900/30 border border-emerald-500/40 rounded-md mx-auto" style={{ width: '45%' }}></div>
        </div>
        
        <div className="mt-5 pt-3 border-t border-neutral-800 text-xs text-neutral-500">
          <div className="flex justify-between">
            <span>Time period: Last 30 days</span>
            <span>Step 1 → Step 3: 3.8% Overall</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 