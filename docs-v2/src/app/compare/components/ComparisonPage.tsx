import { CheckCircle, CircleMinus, CircleX } from "lucide-react";
import { TrackedButton } from "../../../components/TrackedButton";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../../../lib/utils";
import { Tilt_Warp } from "next/font/google";
import React from "react";

const tilt_wrap = Tilt_Warp({
  subsets: ["latin"],
  weight: "400",
});

export interface ComparisonFeature {
  name: string;
  rybbitValue: string | boolean;
  competitorValue: string | boolean;
  tooltip?: string;
}

export interface ComparisonSection {
  title: string;
  features: ComparisonFeature[];
}

export interface ComparisonPageProps {
  competitorName: string;
  competitorLogo?: React.ReactNode;
  sections: ComparisonSection[];
  demoUrl?: string;
  comparisonContent?: React.ReactNode;
}

export function ComparisonPage({
  competitorName,
  competitorLogo,
  sections,
  demoUrl = "https://demo.rybbit.io/21",
  comparisonContent,
}: ComparisonPageProps) {
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <CircleMinus className="w-5 h-5 text-neutral-500" />
      );
    }
    return <span className="text-neutral-300">{value}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden pt-16 md:pt-24">
      <div className="flex flex-col py-8">
        <h1
          className={cn(
            "text-4xl md:text-5xl lg:text-7xl font-medium  px-4 tracking-tight max-w-4xl text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400",
            tilt_wrap.className
          )}
        >
          Rybbit vs. {competitorName}
        </h1>
        <h2 className="text-base md:text-xl pt-4 md:pt-6 px-4 tracking-tight max-w-4xl text-center text-neutral-300 font-light">
          Compare the key features of Rybbit and {competitorName}.
        </h2>

        <div className="flex flex-col items-center my-8 md:my-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-base md:text-lg px-4">
            <Link
              href="https://app.rybbit.io/signup"
              className="w-full sm:w-auto"
              data-rybbit-event="signup"
              data-rybbit-prop-location="hero"
            >
              <TrackedButton
                eventName="signup_click"
                eventData={{ location: "hero", button_text: "Track your site" }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-3 rounded-lg shadow-lg shadow-emerald-900/20 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 cursor-pointer"
              >
                Track your site
              </TrackedButton>
            </Link>
            <Link href="https://demo.rybbit.io/21" className="w-full sm:w-auto" data-rybbit-event="demo">
              <TrackedButton
                eventName="demo_click"
                eventData={{ location: "hero", button_text: "See live demo" }}
                className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white font-medium px-5 py-3 rounded-lg border border-neutral-600 transform hover:-translate-y-0.5 transition-all duration-200 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-50 cursor-pointer"
              >
                See live demo
              </TrackedButton>
            </Link>
          </div>
          <p className="text-neutral-400 text-xs md:text-sm flex items-center justify-center gap-2 mt-6">
            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
            First 10,000 events/m are free. No credit card required.
          </p>
        </div>
      </div>

      {/* <div className="relative w-full max-w-[1300px] mb-10 px-4">
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-emerald-500/40 rounded-full blur-[80px] opacity-70"></div>
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-emerald-600/30 rounded-full blur-[70px] opacity-50"></div>
        
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-40 right-20 w-[350px] h-[350px] bg-indigo-500/30 rounded-full blur-[75px] opacity-50"></div>

        <div className="absolute top-1/4 right-0 w-[320px] h-[320px] bg-purple-500/40 rounded-full blur-[70px] opacity-50"></div>
        <div className="absolute top-1/3 right-20 w-[250px] h-[250px] bg-violet-500/30 rounded-full blur-[65px] opacity-40"></div>

        <div className="absolute bottom-1/3 left-0 w-[320px] h-[320px] bg-emerald-400/30 rounded-full blur-[70px] opacity-60"></div>
        <div className="absolute bottom-1/4 left-20 w-[240px] h-[240px] bg-teal-400/25 rounded-full blur-[65px] opacity-50"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-400/30 rounded-full blur-[80px] opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[350px] h-[350px] bg-sky-400/20 rounded-full blur-[75px] opacity-40"></div>

        <div className="relative z-10 rounded-lg overflow-hidden border-8 border-neutral-100/5 shadow-2xl shadow-emerald-900/10">
          <iframe
            src={demoUrl}
            width="1300"
            height="750"
            className="w-full h-[600px] md:h-[700px] lg:h-[750px]"
            style={{ border: "none" }}
            title="Rybbit Analytics Demo"
          ></iframe>
        </div>
      </div> */}

      <div className="w-full max-w-5xl mx-auto mt-12 px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-left">
          Why choose Rybbit over {competitorName}?
        </h2>
      </div>
      {/* Comparison Table */}
      <section className="pb-12 pt-4 w-full max-w-5xl mx-auto px-4">
        <div className="bg-neutral-900/40 p-2 rounded-3xl border border-neutral-800">
          <div className="bg-neutral-900 backdrop-blur-sm rounded-2xl border border-neutral-800 overflow-hidden text-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left p-6 w-2/5"></th>
                  <th className="text-center p-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white font-semibold">
                        <Image src="/rybbit-text.svg" alt="Rybbit" width={100} height={27} />
                      </span>
                    </div>
                  </th>
                  <th className="text-center p-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white font-semibold">{competitorName}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 bg-neutral-900/70">
                        <span className="text-neutral-400 text-sm font-medium">{section.title}</span>
                      </td>
                    </tr>
                    {section.features.map((feature, featureIndex) => (
                      <tr
                        key={`${sectionIndex}-${featureIndex}`}
                        className={featureIndex < section.features.length - 1 ? "border-b border-neutral-800" : ""}
                      >
                        <td className="px-6 py-4 text-neutral-300 text-sm">
                          {feature.name}
                          {feature.tooltip && (
                            <button className="ml-2 text-neutral-500 hover:text-neutral-400" title={feature.tooltip}>
                              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex justify-center">{renderFeatureValue(feature.rybbitValue)}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex justify-center">{renderFeatureValue(feature.competitorValue)}</div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {comparisonContent && (
        <section className="py-12 md:py-16 w-full max-w-3xl mx-auto px-4">
          <div className="prose prose-invert prose-neutral max-w-none">{comparisonContent}</div>
        </section>
      )}

      <section className="py-12 md:py-20 w-full bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative p-6 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="mb-6 md:mb-8">
              <Image src="/rybbit-text.svg" alt="Rybbit" width={150} height={27} />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              It&apos;s time to switch to analytics that&apos;s made for you
            </h2>
            <p className="text-base md:text-xl text-neutral-300 mb-6 md:mb-10 max-w-3xl mx-auto font-light">
              The first 10,000 events a month are free
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 w-full sm:w-auto">
              <Link href="https://app.rybbit.io/signup" className="w-full sm:w-auto">
                <TrackedButton
                  eventName="signup_click"
                  eventData={{ location: "bottom_cta", button_text: "Track your site for free" }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-medium px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg shadow-emerald-900/20 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 cursor-pointer"
                >
                  Track your site for free
                </TrackedButton>
              </Link>
            </div>

            <p className="text-neutral-400 text-xs md:text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
              No credit card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
