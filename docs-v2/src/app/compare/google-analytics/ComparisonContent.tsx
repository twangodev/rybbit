export function GoogleAnalyticsComparisonContent() {
  return (
    <div className="space-y-6 text-neutral-350 font-light">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Understanding the Key Differences</h2>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Privacy First, Not Privacy Theater</h3>
        <p className="leading-relaxed">
          The fundamental difference between Rybbit and Google Analytics lies in our approach to privacy. While Google
          Analytics collects vast amounts of personal data requiring cookie consent banners to comply with GDPR and
          CCPA, Rybbit is built privacy-first. We don't use cookies, don't track personal information, and are compliant
          by default—meaning you can finally remove those annoying cookie banners while still getting actionable
          insights. Your visitors' privacy is respected, and you stay on the right side of privacy regulations without
          any extra work.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Simplicity Without Sacrifice</h3>
        <p className="leading-relaxed">
          Google Analytics 4 has become notoriously complex, often requiring dedicated specialists or extensive training
          to extract meaningful insights. Its interface is cluttered with hundreds of reports and metrics that most
          businesses never use. Rybbit takes the opposite approach: we provide a clean, intuitive dashboard that anyone
          on your team can understand in seconds. You get all the essential metrics—visitors, page views, sources,
          devices, and conversions—without drowning in complexity. It's analytics that just works, no PhD required.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Lightning Fast, Featherweight Impact</h3>
        <p className="leading-relaxed">
          Website performance directly impacts user experience, SEO rankings, and conversion rates. Google Analytics'
          tracking script weighs around 45KB and makes multiple network requests, measurably slowing down your site.
          Rybbit's script is less than 1KB—that's 45 times smaller—ensuring your analytics never compromise your site's
          performance. Plus, our script loads from a global CDN, making it blazing fast for visitors anywhere in the
          world. Better performance means happier visitors and better search rankings.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">See Everything, Forever</h3>
        <p className="leading-relaxed">
          Google Analytics has significant accuracy issues that most users don't realize. It samples data on
          high-traffic sites (showing you only a fraction of actual visits), has 24-48 hour delays in reporting, and
          automatically deletes your data after 2-14 months. Many ad blockers also block Google Analytics, meaning
          you're missing 15-30% of your visitors. Rybbit gives you 100% accurate, real-time data with no sampling ever.
          We bypass most ad blockers through ethical tracking methods, and your data is retained forever—it's your data,
          after all.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Beyond Analytics: Session Replay</h3>
        <p className="leading-relaxed">
          While Google Analytics tells you what happened on your site through numbers and charts, Rybbit goes further by
          showing you exactly how users interact with your pages through session replay. Watch real user sessions to
          understand behavior patterns, identify usability issues, debug problems, and improve conversion rates. It's
          like having a usability testing lab built into your analytics—something Google Analytics simply doesn't offer.
          See not just the "what" but the "why" behind user behavior.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Your Data, Your Rules</h3>
        <p className="leading-relaxed">
          With Google Analytics, your website's data becomes part of Google's massive advertising ecosystem. They use
          machine learning on your data, potentially share insights with advertisers, and you have no control over how
          it's ultimately used. Rybbit operates on a simple principle: your data belongs to you. We never share it,
          never use it for advertising, and never analyze it for any purpose other than showing you your own analytics.
          Our business model is transparent—we charge for our service, not for access to your data.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Real Support from Real People</h3>
        <p className="leading-relaxed">
          Try getting help with Google Analytics and you'll find yourself lost in forums, outdated documentation, and AI
          chatbots. As a free product, Google provides no real customer support. With Rybbit, you get responsive support
          from actual humans who care about your success. Whether you need help with implementation, have questions
          about your data, or want advice on improving your metrics, we're here to help. You're not just a user; you're
          a valued customer.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl text-white">Made for Modern Websites</h3>
        <p className="leading-relaxed">
          Google Analytics was designed in a different era and it shows. Its complex implementation, heavy scripts, and
          privacy-invasive tracking are increasingly incompatible with modern web standards and user expectations.
          Rybbit is built for today's web: privacy-conscious, performance-optimized, and user-friendly. If you believe
          in building a better, more ethical web while still understanding your audience, Rybbit is the clear choice.
          Join thousands of websites that have already made the switch to analytics that respects both you and your
          visitors.
        </p>
      </div>
    </div>
  );
}
