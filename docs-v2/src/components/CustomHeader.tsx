"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function CustomHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3" aria-label="Global">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/rybbit-text.svg" alt="Rybbit" width={100} height={0} style={{ height: "auto" }} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <div className="flex items-center gap-x-6">
            <Link href="/pricing" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
              Docs
            </Link>
            <a
              href="https://demo.rybbit.io/21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Demo
            </a>
            <a
              href="https://github.com/rybbit-io/rybbit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="hidden md:flex md:items-center">
          {/* Login Button */}
          <a href="https://app.rybbit.io" target="_blank" rel="noopener noreferrer">
            <button className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium px-3 py-1.5 rounded-md border border-neutral-600 transform hover:-translate-y-0.5 transition-all duration-200 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-50">
              Login
            </button>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/pricing"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <a
              href="https://demo.rybbit.io/21"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </a>
            <a
              href="https://github.com/rybbit-io/rybbit"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2 text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </a>
            <div className="pt-2 border-t border-neutral-800">
              <a href="https://app.rybbit.io" target="_blank" rel="noopener noreferrer" className="block w-full">
                <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium px-3 py-2 rounded-md border border-neutral-600">
                  Login
                </button>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
