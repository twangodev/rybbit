import { ComparisonPage } from "../components/ComparisonPage";
import { googleAnalyticsComparisonData } from "./comparison-data";
import { GoogleAnalyticsComparisonContent } from "./ComparisonContent";

export default function GoogleAnalytics() {
  return (
    <ComparisonPage
      competitorName="Google Analytics"
      competitorLogo={<span className="text-white font-bold">GA</span>}
      sections={googleAnalyticsComparisonData}
      comparisonContent={<GoogleAnalyticsComparisonContent />}
    />
  );
}
