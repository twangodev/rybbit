"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, TrendingUp, TrendingDown, Monitor, Globe, Smartphone, Tablet, BarChart3, PieChart, LineChart, MapPin, Eye, MousePointer, Target } from "lucide-react";
import { useGetSearchConsoleData } from "@/api/analytics/searchConsole/useGetSearchConsoleData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

export default function SearchConsolePage() {
  const params = useParams();
  const siteId = params.site as string;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: searchConsoleData, isLoading, error } = useGetSearchConsoleData();

  const handleConnect = async () => {
    // OAuth connection logic
    window.location.href = `/api/site/${siteId}/search-console/oauth/url`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center max-w-md mx-auto p-6">
          <Search className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Connection Error</h1>
          <p className="text-neutral-400 mb-6">
            {error.message || "Failed to load search console data"}
          </p>
          <Button onClick={handleConnect} className="w-full bg-blue-600 hover:bg-blue-700">
            Connect Search Console
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400 mt-4">Loading Search Console data...</p>
        </div>
      </div>
    );
  }

  if (!searchConsoleData || searchConsoleData.clicks === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center max-w-md mx-auto p-6">
          <Search className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">No Search Data</h1>
          <p className="text-neutral-400 mb-6">
            Connect your Google Search Console to see your search performance data
          </p>
          <Button onClick={handleConnect} className="w-full bg-blue-600 hover:bg-blue-700">
            Connect Search Console
          </Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const timeSeriesData = [
    {
      id: "clicks",
      color: "#3b82f6",
      data: searchConsoleData.timeSeries.map(item => ({
        x: item.date,
        y: item.clicks
      }))
    },
    {
      id: "impressions",
      color: "#10b981",
      data: searchConsoleData.timeSeries.map(item => ({
        x: item.date,
        y: item.impressions
      }))
    }
  ];

  const deviceData = searchConsoleData.deviceBreakdown.map(item => ({
    id: item.device,
    label: item.device,
    value: item.clicks,
    color: item.device === "desktop" ? "#3b82f6" : item.device === "mobile" ? "#10b981" : "#f59e0b"
  }));

  const countryData = searchConsoleData.countryBreakdown.map(item => ({
    id: item.country,
    label: item.country,
    value: item.clicks,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const searchAppearanceData = searchConsoleData.searchAppearance.map(item => ({
    id: item.appearance,
    label: item.appearance,
    value: item.clicks,
    color: item.appearance === "Web" ? "#3b82f6" : "#10b981"
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Console Analytics</h1>
          <p className="text-neutral-400">
            Comprehensive search performance insights from Google Search Console
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total Clicks</p>
                  <p className="text-2xl font-bold">{searchConsoleData.clicks.toLocaleString()}</p>
                </div>
                <MousePointer className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total Impressions</p>
                  <p className="text-2xl font-bold">{searchConsoleData.impressions.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Average CTR</p>
                  <p className="text-2xl font-bold">{searchConsoleData.ctr.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Average Position</p>
                  <p className="text-2xl font-bold">{searchConsoleData.averagePosition.toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-neutral-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Series Chart */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Performance Over Time
                  </CardTitle>
                  <CardDescription>
                    Clicks and impressions trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={timeSeriesData}
                      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                      xScale={{ type: "time", format: "%Y-%m-%d" }}
                      xFormat="time:%Y-%m-%d"
                      yScale={{ type: "linear", min: "auto", max: "auto" }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        format: "%b %d",
                        legend: "Date",
                        legendOffset: 36,
                        legendPosition: "middle"
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Count",
                        legendOffset: -40,
                        legendPosition: "middle"
                      }}
                      pointSize={10}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      legends={[
                        {
                          anchor: "top",
                          direction: "row",
                          justify: false,
                          translateX: 0,
                          translateY: -20,
                          itemsSpacing: 0,
                          itemDirection: "left-to-right",
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: "circle",
                          symbolBorderColor: "rgba(0, 0, 0, .5)",
                          effects: [
                            {
                              on: "hover",
                              style: {
                                itemBackground: "rgba(0, 0, 0, .03)",
                                itemOpacity: 1
                              }
                            }
                          ]
                        }
                      ]}
                      theme={{
                        background: "transparent",
                        text: {
                          fontSize: 11,
                          fill: "#9ca3af"
                        },
                        axis: {
                          domain: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            }
                          },
                          legend: {
                            text: {
                              fontSize: 12,
                              fill: "#9ca3af"
                            }
                          },
                          ticks: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            },
                            text: {
                              fontSize: 11,
                              fill: "#9ca3af"
                            }
                          }
                        },
                        grid: {
                          line: {
                            stroke: "#374151",
                            strokeWidth: 1
                          }
                        },
                        legends: {
                          text: {
                            fontSize: 11,
                            fill: "#9ca3af"
                          }
                        },
                        tooltip: {
                          container: {
                            background: "#1f2937",
                            color: "#f9fafb",
                            fontSize: 12,
                            borderRadius: 4,
                            boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Traffic by Device
                  </CardTitle>
                  <CardDescription>
                    Clicks distribution across devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveBar
                      data={deviceData}
                      keys={["value"]}
                      indexBy="label"
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: "linear" }}
                      indexScale={{ type: "band", round: true }}
                      colors={{ scheme: "nivo" }}
                      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Device",
                        legendPosition: "middle",
                        legendOffset: 32
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Clicks",
                        legendPosition: "middle",
                        legendOffset: -40
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      theme={{
                        background: "transparent",
                        text: {
                          fontSize: 11,
                          fill: "#9ca3af"
                        },
                        axis: {
                          domain: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            }
                          },
                          legend: {
                            text: {
                              fontSize: 12,
                              fill: "#9ca3af"
                            }
                          },
                          ticks: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            },
                            text: {
                              fontSize: 11,
                              fill: "#9ca3af"
                            }
                          }
                        },
                        grid: {
                          line: {
                            stroke: "#374151",
                            strokeWidth: 1
                          }
                        },
                        tooltip: {
                          container: {
                            background: "#1f2937",
                            color: "#f9fafb",
                            fontSize: 12,
                            borderRadius: 4,
                            boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Country and Search Appearance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top Countries
                  </CardTitle>
                  <CardDescription>
                    Traffic by country
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.countryBreakdown.slice(0, 5).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{country.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{country.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Search Appearance
                  </CardTitle>
                  <CardDescription>
                    Traffic by search appearance type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.searchAppearance.map((appearance, index) => (
                      <div key={appearance.appearance} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{appearance.appearance}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{appearance.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{appearance.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Position vs CTR Scatter */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Position vs CTR Analysis</CardTitle>
                  <CardDescription>
                    Relationship between search position and click-through rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topQueries.slice(0, 10).map((query, index) => (
                      <div key={query.query} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{query.query}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {query.position.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{query.ctr.toFixed(1)}%</div>
                          <div className="text-sm text-neutral-400">{query.clicks} clicks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Type Breakdown */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Search Type Performance</CardTitle>
                  <CardDescription>
                    Performance by search type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveBar
                      data={searchConsoleData.searchTypeBreakdown}
                      keys={["clicks", "impressions"]}
                      indexBy="searchType"
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                      padding={0.3}
                      groupMode="grouped"
                      valueScale={{ type: "linear" }}
                      indexScale={{ type: "band", round: true }}
                      colors={{ scheme: "nivo" }}
                      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Search Type",
                        legendPosition: "middle",
                        legendOffset: 32
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Count",
                        legendPosition: "middle",
                        legendOffset: -40
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      legends={[
                        {
                          dataFrom: "keys",
                          anchor: "bottom-right",
                          direction: "column",
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: "left-to-right",
                          itemOpacity: 0.85,
                          symbolSize: 20,
                          effects: [
                            {
                              on: "hover",
                              style: {
                                itemOpacity: 1
                              }
                            }
                          ]
                        }
                      ]}
                      theme={{
                        background: "transparent",
                        text: {
                          fontSize: 11,
                          fill: "#9ca3af"
                        },
                        axis: {
                          domain: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            }
                          },
                          legend: {
                            text: {
                              fontSize: 12,
                              fill: "#9ca3af"
                            }
                          },
                          ticks: {
                            line: {
                              stroke: "#374151",
                              strokeWidth: 1
                            },
                            text: {
                              fontSize: 11,
                              fill: "#9ca3af"
                            }
                          }
                        },
                        grid: {
                          line: {
                            stroke: "#374151",
                            strokeWidth: 1
                          }
                        },
                        legends: {
                          text: {
                            fontSize: 11,
                            fill: "#9ca3af"
                          }
                        },
                        tooltip: {
                          container: {
                            background: "#1f2937",
                            color: "#f9fafb",
                            fontSize: 12,
                            borderRadius: 4,
                            boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Queries Tab */}
          <TabsContent value="queries" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Queries */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Top Performing Queries</CardTitle>
                  <CardDescription>
                    Queries with highest clicks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topQueries.map((query, index) => (
                      <div key={query.query} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{query.query}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {query.position.toFixed(1)} • {query.impressions.toLocaleString()} impressions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{query.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{query.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Position Improvements */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Position Improvements</CardTitle>
                  <CardDescription>
                    Queries with best position gains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topPositionImprovements.map((query, index) => (
                      <div key={query.query} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{query.query}</div>
                          <div className="text-sm text-neutral-400">
                            Current: {query.position.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {query.positionChange > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`font-medium ${query.positionChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {query.positionChange > 0 ? '+' : ''}{query.positionChange.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-sm text-neutral-400">{query.clicks} clicks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages by Clicks */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Top Pages by Clicks</CardTitle>
                  <CardDescription>
                    Pages with highest click-through rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topPagesByClicks.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{page.page}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {page.position.toFixed(1)} • {page.impressions.toLocaleString()} impressions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{page.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{page.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages by Impressions */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Top Pages by Impressions</CardTitle>
                  <CardDescription>
                    Pages with highest visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topPagesByImpressions.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{page.page}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {page.position.toFixed(1)} • {page.clicks.toLocaleString()} clicks
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{page.impressions.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{page.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Performance */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Device Performance</CardTitle>
                  <CardDescription>
                    Detailed device breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.deviceBreakdown.map((device, index) => (
                      <div key={device.device} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {device.device === "desktop" && <Monitor className="w-5 h-5 text-blue-500" />}
                          {device.device === "mobile" && <Smartphone className="w-5 h-5 text-green-500" />}
                          {device.device === "tablet" && <Tablet className="w-5 h-5 text-orange-500" />}
                          <span className="font-medium capitalize">{device.device}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{device.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">
                            {device.ctr.toFixed(1)}% CTR • Pos {device.averagePosition.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Country Performance */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Country Performance</CardTitle>
                  <CardDescription>
                    Traffic by geographic location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.countryBreakdown.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{country.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">
                            {country.ctr.toFixed(1)}% CTR • Pos {country.averagePosition.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rich Results */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Rich Results Performance</CardTitle>
                  <CardDescription>
                    Enhanced search result types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.richResults.map((result, index) => (
                      <div key={result.type} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{result.type}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {result.averagePosition.toFixed(1)} • {result.impressions.toLocaleString()} impressions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{result.clicks.toLocaleString()}</div>
                          <div className="text-sm text-neutral-400">{result.ctr.toFixed(1)}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Clicks Growth */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle>Top Clicks Growth</CardTitle>
                  <CardDescription>
                    Queries with highest click growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchConsoleData.topClicksGrowth.map((query, index) => (
                      <div key={query.query} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium truncate">{query.query}</div>
                          <div className="text-sm text-neutral-400">
                            Position: {query.position.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-500">+{query.clicksChange}</span>
                          </div>
                          <div className="text-sm text-neutral-400">{query.clicks} total clicks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
