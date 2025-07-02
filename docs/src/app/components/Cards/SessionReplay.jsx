"use client";

import { Card } from "./Card";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Volume2, Laptop } from "lucide-react";
import { useState } from "react";
import { CountryFlag } from "../Country";
import { Browser } from "../Browser";
import { OperatingSystem } from "../OperatingSystem";

export function SessionReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <Card 
      title="Session Replay" 
      description="Watch real user sessions to understand their behavior and identify pain points."
    >
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        {/* Video player container */}
        <div className="relative bg-black">
          {/* Mock website content */}
          <div className="aspect-video bg-neutral-950 relative overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-neutral-800 h-8 flex items-center px-3 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-neutral-700 rounded px-3 py-1 text-xs text-neutral-300">
                  https://example.com/products
                </div>
              </div>
            </div>
            
            {/* Mock website content */}
            <div className="p-4 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-24 h-6 bg-neutral-300 rounded"></div>
                <div className="flex gap-4">
                  <div className="w-16 h-4 bg-neutral-200 rounded"></div>
                  <div className="w-16 h-4 bg-neutral-200 rounded"></div>
                  <div className="w-16 h-4 bg-neutral-200 rounded"></div>
                </div>
              </div>
              
              {/* Hero section */}
              <div className="mb-6">
                <div className="w-48 h-8 bg-neutral-800 rounded mb-2"></div>
                <div className="w-64 h-4 bg-neutral-200 rounded"></div>
              </div>
              
              {/* Product grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-100 rounded p-2">
                  <div className="w-full h-20 bg-neutral-300 rounded mb-2"></div>
                  <div className="w-full h-3 bg-neutral-200 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-emerald-500 rounded"></div>
                </div>
                <div className="bg-neutral-100 rounded p-2">
                  <div className="w-full h-20 bg-neutral-300 rounded mb-2"></div>
                  <div className="w-full h-3 bg-neutral-200 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-emerald-500 rounded"></div>
                </div>
                <div className="bg-neutral-100 rounded p-2">
                  <div className="w-full h-20 bg-neutral-300 rounded mb-2"></div>
                  <div className="w-full h-3 bg-neutral-200 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-emerald-500 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Mouse cursor */}
            <div className="absolute top-32 left-48 w-4 h-4 transform -rotate-12">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M5.5 3.5L20.5 12L12 14.5L9.5 22L5.5 3.5Z" fill="white" stroke="black" strokeWidth="1"/>
              </svg>
            </div>
            
            {/* Click ripple effect */}
            {isPlaying && (
              <div className="absolute top-48 left-32 w-8 h-8 rounded-full border-2 border-blue-500 animate-ping"></div>
            )}
          </div>
        </div>
        
        {/* Video controls */}
        <div className="bg-neutral-800/50 backdrop-blur-sm p-3">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>2:34</span>
              <span>5:12</span>
            </div>
            <div className="relative h-1 bg-neutral-700 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1/2 bg-emerald-500 rounded-full"></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg"></div>
            </div>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="text-neutral-300 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-2 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button className="text-neutral-300 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="text-neutral-300 hover:text-white transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
              <button className="text-neutral-300 hover:text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Session info */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-neutral-300">Session #48291</div>
              <div className="text-xs text-neutral-500">User clicked "Add to Cart" 3 times</div>
            </div>
            <div className="flex items-center gap-2">
              <CountryFlag country="US" />
              <Browser browser="Chrome" />
              <OperatingSystem os="Windows" />
              <Laptop className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}