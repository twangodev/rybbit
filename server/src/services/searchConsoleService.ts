import { google } from 'googleapis';
import { db } from '../db/postgres/postgres.js';
import { sites } from '../db/postgres/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { googleOAuthService } from './googleOAuthService.js';

interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Time series data for charts
  timeSeries: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Device breakdown
  deviceBreakdown: Array<{
    device: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Country breakdown
  countryBreakdown: Array<{
    country: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Search appearance breakdown
  searchAppearance: Array<{
    appearance: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Top queries by position improvement
  topPositionImprovements: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    positionChange: number;
  }>;
  // Top queries by clicks growth
  topClicksGrowth: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    clicksChange: number;
  }>;
  // Page performance by clicks
  topPagesByClicks: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Page performance by impressions
  topPagesByImpressions: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Search type breakdown
  searchTypeBreakdown: Array<{
    searchType: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Rich results data
  richResults: Array<{
    type: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Core Web Vitals data (if available)
  coreWebVitals?: {
    lcp: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
    fid: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
    cls: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
  };
}

export class SearchConsoleService {
  private static instance: SearchConsoleService;

  private constructor() {}

  public static getInstance(): SearchConsoleService {
    if (!SearchConsoleService.instance) {
      SearchConsoleService.instance = new SearchConsoleService();
    }
    return SearchConsoleService.instance;
  }

  async getSearchConsoleSitesWithStatus(orgId: string): Promise<Array<{
    siteUrl: string;
    permissionLevel: string;
    domain: string;
    isExisting: boolean;
  }>> {
    try {
      // Get all sites in the organization to find one with full Search Console access
      const orgSites = await db
        .select({
          siteId: sites.siteId,
          domain: sites.domain,
          createdBy: sites.createdBy,
        })
        .from(sites)
        .where(eq(sites.organizationId, orgId));

      if (!orgSites.length) {
        throw new Error('No sites found in organization');
      }

      let searchConsoleSites: any[] = [];
      let accessToken: string | null = null;

      // Try each site's access token until we find one that can access all Search Console sites
      for (const site of orgSites) {
        try {
          console.log(`Trying to get Search Console sites using token from site: ${site.domain}`);
          
          accessToken = await googleOAuthService.getValidAccessToken(site.siteId);
          if (!accessToken) {
            console.log(`No valid access token for site: ${site.domain}`);
            continue;
          }

          const searchconsole = google.searchconsole({
            version: 'v1',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const sitesResponse = await searchconsole.sites.list();
          const sites = sitesResponse.data.siteEntry || [];
          
          console.log(`Site ${site.domain} can access ${sites.length} Search Console sites`);
          
          // If this site can access more sites than we've found so far, use it
          if (sites.length > searchConsoleSites.length) {
            searchConsoleSites = sites;
            console.log(`Using access token from site: ${site.domain} (can access ${sites.length} sites)`);
          }
          
          // If we found a site that can access many sites, we can stop searching
          if (sites.length >= 5) {
            break;
          }
        } catch (error) {
          console.log(`Error getting Search Console sites with token from ${site.domain}:`, error);
          continue;
        }
      }

      if (!accessToken) {
        throw new Error('Search Console not connected. Please connect your Google account.');
      }

      if (!searchConsoleSites.length) {
        throw new Error('No Search Console sites found. Please verify your sites in Google Search Console.');
      }
      
             console.log('Raw Search Console sites:', searchConsoleSites);
       console.log('Total sites from Search Console API:', searchConsoleSites.length);
       console.log('Search Console sites details:', searchConsoleSites.map(site => ({
         siteUrl: site.siteUrl,
         permissionLevel: site.permissionLevel
       })));

       // Get existing sites in the organization
       const existingSites = await db
         .select({
           domain: sites.domain,
         })
         .from(sites)
         .where(eq(sites.organizationId, orgId));

       const existingDomains = new Set(existingSites.map(site => site.domain));
       console.log('Existing domains in org:', Array.from(existingDomains));

       const result = [];

       console.log(`Processing ${searchConsoleSites.length} Search Console sites...`);
       
       for (const searchConsoleSite of searchConsoleSites) {
         try {
           const siteUrl = searchConsoleSite.siteUrl;
           if (!siteUrl) {
             console.log('Skipping site with no siteUrl');
             continue;
           }

                     let domain = siteUrl;

           // Extract domain from sc-domain: or sc-prefix: format
           if (siteUrl.startsWith('sc-domain:')) {
             domain = siteUrl.replace('sc-domain:', '');
           } else if (siteUrl.startsWith('sc-prefix:')) {
             domain = siteUrl.replace('sc-prefix:', '');
           } else if (siteUrl.startsWith('https://')) {
             domain = siteUrl.replace('https://', '');
           } else if (siteUrl.startsWith('http://')) {
             domain = siteUrl.replace('http://', '');
           }

           // Remove trailing slash
           domain = domain.replace(/\/$/, '');

           if (!domain) {
             console.log(`Skipping site with empty domain: ${siteUrl}`);
             continue;
           }

           console.log(`Processing site: ${siteUrl} -> domain: ${domain}, existing: ${existingDomains.has(domain)}`);

           const siteResult = {
             siteUrl,
             permissionLevel: searchConsoleSite.permissionLevel || 'unknown',
             domain,
             isExisting: existingDomains.has(domain),
           };
           
           console.log('Adding site to result:', siteResult);
           result.push(siteResult);
                 } catch (siteError) {
           console.error(`Error processing site ${searchConsoleSite.siteUrl}:`, siteError);
           console.error('Full error details:', siteError);
         }
             }

       console.log('Final result:', result);
       return result;
    } catch (error) {
      console.error('Error getting Search Console sites with status:', error);
      throw error;
    }
  }

  async addAllSearchConsoleSitesToOrg(orgId: string): Promise<{ added: string[]; existing: string[]; errors: string[] }> {
    try {
      // Get all sites in the organization to find one with full Search Console access
      const orgSites = await db
        .select({
          siteId: sites.siteId,
          domain: sites.domain,
          createdBy: sites.createdBy,
        })
        .from(sites)
        .where(eq(sites.organizationId, orgId));

      if (!orgSites.length) {
        throw new Error('No sites found in organization');
      }

      let searchConsoleSites: any[] = [];
      let accessToken: string | null = null;
      let selectedSite = orgSites[0]; // Default to first site for createdBy

      // Try each site's access token until we find one that can access all Search Console sites
      for (const site of orgSites) {
        try {
          console.log(`Trying to get Search Console sites using token from site: ${site.domain}`);
          
          const token = await googleOAuthService.getValidAccessToken(site.siteId);
          if (!token) {
            console.log(`No valid access token for site: ${site.domain}`);
            continue;
          }

          const searchconsole = google.searchconsole({
            version: 'v1',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const sitesResponse = await searchconsole.sites.list();
          const sites = sitesResponse.data.siteEntry || [];
          
          console.log(`Site ${site.domain} can access ${sites.length} Search Console sites`);
          
          // If this site can access more sites than we've found so far, use it
          if (sites.length > searchConsoleSites.length) {
            searchConsoleSites = sites;
            accessToken = token;
            selectedSite = site;
            console.log(`Using access token from site: ${site.domain} (can access ${sites.length} sites)`);
          }
          
          // If we found a site that can access many sites, we can stop searching
          if (sites.length >= 5) {
            break;
          }
        } catch (error) {
          console.log(`Error getting Search Console sites with token from ${site.domain}:`, error);
          continue;
        }
      }

      if (!accessToken) {
        throw new Error('Search Console not connected. Please connect your Google account.');
      }

      if (!searchConsoleSites.length) {
        throw new Error('No Search Console sites found. Please verify your sites in Google Search Console.');
      }

      const added: string[] = [];
      const existing: string[] = [];
      const errors: string[] = [];

      for (const searchConsoleSite of searchConsoleSites) {
        try {
          const siteUrl = searchConsoleSite.siteUrl;
          if (!siteUrl) {
            errors.push('Site URL is null or undefined');
            continue;
          }

          let domain = siteUrl;

          // Extract domain from sc-domain: or sc-prefix: format
          if (siteUrl.startsWith('sc-domain:')) {
            domain = siteUrl.replace('sc-domain:', '');
          } else if (siteUrl.startsWith('sc-prefix:')) {
            domain = siteUrl.replace('sc-prefix:', '');
          } else if (siteUrl.startsWith('https://')) {
            domain = siteUrl.replace('https://', '');
          } else if (siteUrl.startsWith('http://')) {
            domain = siteUrl.replace('http://', '');
          }

          // Remove trailing slash
          domain = domain.replace(/\/$/, '');

          if (!domain) {
            errors.push(`Could not extract domain from ${siteUrl}`);
            continue;
          }

          // Check if site already exists in the organization
          const existingSite = await db
            .select({ siteId: sites.siteId })
            .from(sites)
            .where(and(eq(sites.organizationId, orgId), eq(sites.domain, domain)))
            .limit(1);

          if (existingSite[0]) {
            existing.push(domain);
            continue;
          }

          // Add new site to the organization using raw SQL to avoid TypeScript issues
          await db.execute(sql`
            INSERT INTO sites (organization_id, domain, name, created_by, created_at, updated_at, public, salt_user_ids, block_bots, excluded_ips)
            VALUES (${orgId}, ${domain}, ${domain}, ${selectedSite.createdBy}, NOW(), NOW(), false, false, true, '[]'::jsonb)
          `);

          added.push(domain);
          console.log(`Added site ${domain} to organization ${orgId}`);
        } catch (siteError) {
          console.error(`Error adding site ${searchConsoleSite.siteUrl}:`, siteError);
          const errorMessage = siteError instanceof Error ? siteError.message : 'Unknown error';
          console.error('Full error details:', siteError);
          errors.push(`${searchConsoleSite.siteUrl}: ${errorMessage}`);
        }
      }

      console.log(`Finished adding sites. Added: ${added.length}, Existing: ${existing.length}, Errors: ${errors.length}`);
      return { added, existing, errors };
    } catch (error) {
      console.error('Error adding Search Console sites to organization:', error);
      console.error('Full error details:', error);
      throw error;
    }
  }

  async getSearchConsoleData(siteId: number, startDate: string, endDate: string): Promise<SearchConsoleData> {
    try {
      // Get the site's domain
      const site = await db
        .select({
          domain: sites.domain,
        })
        .from(sites)
        .where(eq(sites.siteId, siteId))
        .limit(1);

      if (!site[0]?.domain) {
        throw new Error('Site domain not found');
      }

      const domain = site[0].domain;
      console.log(`Fetching Search Console data for domain: ${domain}`);

      // Get valid OAuth2 access token
      const accessToken = await googleOAuthService.getValidAccessToken(siteId);
      if (!accessToken) {
        throw new Error('Search Console not connected. Please connect your Google account.');
      }

      // Initialize the Search Console API with OAuth2
      const searchconsole = google.searchconsole({
        version: 'v1',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // First, let's check if the site is verified in Search Console
      try {
        const sitesResponse = await searchconsole.sites.list();
        console.log('Available Search Console sites:', sitesResponse.data.siteEntry);
        
        const verifiedSite = sitesResponse.data.siteEntry?.find(
          (site: any) => {
            const siteUrl = site.siteUrl;
            // Check for exact matches and sc-domain: prefixed matches
            return siteUrl === `https://${domain}` || 
                   siteUrl === `http://${domain}` || 
                   siteUrl === domain ||
                   siteUrl === `sc-domain:${domain}` ||
                   siteUrl === `sc-prefix:${domain}`;
          }
        );
        
        if (!verifiedSite) {
          console.log(`Site ${domain} not found in Search Console. Available sites:`, sitesResponse.data.siteEntry);
          throw new Error(`Site ${domain} is not verified in Google Search Console. Please add and verify your site first.`);
        }
        
        console.log(`Found verified site: ${verifiedSite.siteUrl}`);
      } catch (sitesError) {
        console.error('Error checking Search Console sites:', sitesError);
        throw new Error('Unable to verify site in Google Search Console');
      }

      // Try different site URL formats - prioritize sc-domain: format since that's what Search Console uses
      const siteUrlFormats = [
        `sc-domain:${domain}`,
        `sc-prefix:${domain}`,
        `https://${domain}`,
        `http://${domain}`,
        domain
      ];

      let successfulFormat: string | undefined;

      // Find a working site URL format
      for (const siteUrl of siteUrlFormats) {
        try {
          console.log(`Testing site URL format: ${siteUrl}`);
          await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
              startDate,
              endDate,
              dimensions: ['query'],
              rowLimit: 1,
            },
          });
          successfulFormat = siteUrl;
          console.log(`Success with format: ${siteUrl}`);
          break;
        } catch (formatError: any) {
          console.log(`Failed with format ${siteUrl}:`, formatError.message);
          if (formatError.code === 403) {
            throw new Error(`Access denied for ${siteUrl}. Make sure your site is verified in Google Search Console.`);
          }
        }
      }

      if (!successfulFormat) {
        throw new Error(`Unable to fetch data for domain ${domain}. Please verify the site is added to Google Search Console.`);
      }

      // Fetch comprehensive data with different dimensions
      const [
        queryPageData,
        timeSeriesData,
        deviceData,
        countryData,
        searchAppearanceData,
        searchTypeData,
        richResultsData
      ] = await Promise.all([
        // Basic query and page data
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['query', 'page'], 100),
        // Time series data
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['date'], 1000),
        // Device breakdown
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['device'], 100),
        // Country breakdown
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['country'], 100),
        // Search appearance
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['searchAppearance'], 100),
        // Search type
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['searchType'], 100),
        // Rich results
        this.fetchSearchAnalytics(searchconsole, successfulFormat, startDate, endDate, ['richResults'], 100)
      ]);

      // Process the data
      const processedData = this.processSearchConsoleData(
        queryPageData,
        timeSeriesData,
        deviceData,
        countryData,
        searchAppearanceData,
        searchTypeData,
        richResultsData
      );

      return processedData;
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      
      // If no data is found, return empty data instead of mock data
      if (error instanceof Error && error.message.includes('no data')) {
        return this.getEmptyData();
      }
      
      // For other errors, throw them so the frontend can handle them properly
      throw error;
    }
  }

  private async fetchSearchAnalytics(
    searchconsole: any,
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions: string[],
    rowLimit: number
  ) {
    try {
      const response = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
        },
      });
      return response.data.rows || [];
    } catch (error) {
      console.log(`Failed to fetch data for dimensions ${dimensions}:`, error);
      return [];
    }
  }

  private processSearchConsoleData(
    queryPageData: any[],
    timeSeriesData: any[],
    deviceData: any[],
    countryData: any[],
    searchAppearanceData: any[],
    searchTypeData: any[],
    richResultsData: any[]
  ): SearchConsoleData {
    // Process basic metrics
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    const queryMap = new Map<string, { clicks: number; impressions: number; position: number }>();
    const pageMap = new Map<string, { clicks: number; impressions: number; position: number }>();

    // Process query and page data
    queryPageData.forEach((row: any) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const position = row.position || 0;

      totalClicks += clicks;
      totalImpressions += impressions;
      totalPosition += position * impressions;

      // Process queries
      if (row.keys && row.keys[0]) {
        const query = row.keys[0];
        const existing = queryMap.get(query) || { clicks: 0, impressions: 0, position: 0 };
        queryMap.set(query, {
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          position: existing.position + (position * impressions),
        });
      }

      // Process pages
      if (row.keys && row.keys[1]) {
        const page = row.keys[1];
        const existing = pageMap.get(page) || { clicks: 0, impressions: 0, position: 0 };
        pageMap.set(page, {
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          position: existing.position + (position * impressions),
        });
      }
    });

    // Calculate averages
    const averagePosition = totalImpressions > 0 ? totalPosition / totalImpressions : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Process time series data
    const timeSeries = this.processTimeSeriesData(timeSeriesData);

    // Process device breakdown
    const deviceBreakdown = this.processDimensionData(deviceData, 'device');

    // Process country breakdown
    const countryBreakdown = this.processDimensionData(countryData, 'country');

    // Process search appearance
    const searchAppearance = this.processDimensionData(searchAppearanceData, 'searchAppearance');

    // Process search type
    const searchTypeBreakdown = this.processDimensionData(searchTypeData, 'searchType');

    // Process rich results
    const richResults = this.processDimensionData(richResultsData, 'richResults');

    // Convert maps to arrays and sort
    const topQueries = this.convertQueryMapToArray(queryMap, 10);
    const topPages = this.convertPageMapToArray(pageMap, 10);
    const topPagesByClicks = this.convertPageMapToArray(pageMap, 10, 'clicks');
    const topPagesByImpressions = this.convertPageMapToArray(pageMap, 10, 'impressions');

    // Generate position improvements and clicks growth (mock data for now)
    const topPositionImprovements = topQueries.slice(0, 5).map(query => ({
      ...query,
      positionChange: Math.random() * 5 - 2.5 // Random change between -2.5 and +2.5
    }));

    const topClicksGrowth = topQueries.slice(0, 5).map(query => ({
      ...query,
      clicksChange: Math.floor(Math.random() * 50) // Random growth between 0 and 50
    }));

    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr,
      averagePosition,
      topQueries,
      topPages,
      timeSeries,
      deviceBreakdown,
      countryBreakdown,
      searchAppearance,
      topPositionImprovements,
      topClicksGrowth,
      topPagesByClicks,
      topPagesByImpressions,
      searchTypeBreakdown,
      richResults,
      coreWebVitals: undefined // Will be implemented separately
    };
  }

  private processTimeSeriesData(data: any[]): Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }> {
    const dateMap = new Map<string, { clicks: number; impressions: number; position: number }>();

    data.forEach((row: any) => {
      if (row.keys && row.keys[0]) {
        const date = row.keys[0];
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const position = row.position || 0;

        const existing = dateMap.get(date) || { clicks: 0, impressions: 0, position: 0 };
        dateMap.set(date, {
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          position: existing.position + (position * impressions),
        });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        averagePosition: data.impressions > 0 ? data.position / data.impressions : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private processDimensionData(data: any[], dimensionKey: string): any[] {
    const dimensionMap = new Map<string, { clicks: number; impressions: number; position: number }>();

    data.forEach((row: any) => {
      if (row.keys && row.keys[0]) {
        const dimension = row.keys[0];
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const position = row.position || 0;

        const existing = dimensionMap.get(dimension) || { clicks: 0, impressions: 0, position: 0 };
        dimensionMap.set(dimension, {
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          position: existing.position + (position * impressions),
        });
      }
    });

    return Array.from(dimensionMap.entries())
      .map(([dimension, data]) => ({
        [dimensionKey]: dimension,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        averagePosition: data.impressions > 0 ? data.position / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  private convertQueryMapToArray(
    queryMap: Map<string, { clicks: number; impressions: number; position: number }>,
    limit: number
  ) {
    return Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.position / data.impressions : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  private convertPageMapToArray(
    pageMap: Map<string, { clicks: number; impressions: number; position: number }>,
    limit: number,
    sortBy: 'clicks' | 'impressions' = 'clicks'
  ) {
    return Array.from(pageMap.entries())
      .map(([page, data]) => ({
        page,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        position: data.impressions > 0 ? data.position / data.impressions : 0,
      }))
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, limit);
  }

  private getEmptyData(): SearchConsoleData {
    return {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      averagePosition: 0,
      topQueries: [],
      topPages: [],
      timeSeries: [],
      deviceBreakdown: [],
      countryBreakdown: [],
      searchAppearance: [],
      topPositionImprovements: [],
      topClicksGrowth: [],
      topPagesByClicks: [],
      topPagesByImpressions: [],
      searchTypeBreakdown: [],
      richResults: [],
      coreWebVitals: undefined
    };
  }

  private getMockData(): SearchConsoleData {
    // Return some mock data to show the API is working
    return {
      clicks: 1250,
      impressions: 15000,
      ctr: 8.33,
      averagePosition: 12.5,
      topQueries: [
        {
          query: "example search term",
          clicks: 150,
          impressions: 1200,
          ctr: 12.5,
          position: 8.2,
        },
        {
          query: "another search query",
          clicks: 120,
          impressions: 1000,
          ctr: 12.0,
          position: 10.1,
        },
      ],
      topPages: [
        {
          page: "https://example.com/page1",
          clicks: 200,
          impressions: 1500,
          ctr: 13.33,
          position: 7.5,
        },
        {
          page: "https://example.com/page2",
          clicks: 180,
          impressions: 1200,
          ctr: 15.0,
          position: 9.2,
        },
      ],
      timeSeries: [
        { date: "2024-01-01", clicks: 50, impressions: 600, ctr: 8.33, averagePosition: 12.5 },
        { date: "2024-01-02", clicks: 45, impressions: 550, ctr: 8.18, averagePosition: 12.8 },
        { date: "2024-01-03", clicks: 60, impressions: 700, ctr: 8.57, averagePosition: 12.2 },
      ],
      deviceBreakdown: [
        { device: "desktop", clicks: 800, impressions: 9000, ctr: 8.89, averagePosition: 11.5 },
        { device: "mobile", clicks: 400, impressions: 5000, ctr: 8.0, averagePosition: 14.2 },
        { device: "tablet", clicks: 50, impressions: 1000, ctr: 5.0, averagePosition: 16.8 },
      ],
      countryBreakdown: [
        { country: "United States", clicks: 600, impressions: 7000, ctr: 8.57, averagePosition: 12.1 },
        { country: "United Kingdom", clicks: 200, impressions: 2500, ctr: 8.0, averagePosition: 13.2 },
        { country: "Germany", clicks: 150, impressions: 1800, ctr: 8.33, averagePosition: 12.8 },
      ],
      searchAppearance: [
        { appearance: "Web", clicks: 1200, impressions: 14000, ctr: 8.57, averagePosition: 12.3 },
        { appearance: "Image", clicks: 50, impressions: 1000, ctr: 5.0, averagePosition: 18.5 },
      ],
      topPositionImprovements: [
        { query: "example search term", clicks: 150, impressions: 1200, ctr: 12.5, position: 8.2, positionChange: -2.1 },
        { query: "another search query", clicks: 120, impressions: 1000, ctr: 12.0, position: 10.1, positionChange: -1.8 },
      ],
      topClicksGrowth: [
        { query: "example search term", clicks: 150, impressions: 1200, ctr: 12.5, position: 8.2, clicksChange: 25 },
        { query: "another search query", clicks: 120, impressions: 1000, ctr: 12.0, position: 10.1, clicksChange: 18 },
      ],
      topPagesByClicks: [
        { page: "https://example.com/page1", clicks: 200, impressions: 1500, ctr: 13.33, position: 7.5 },
        { page: "https://example.com/page2", clicks: 180, impressions: 1200, ctr: 15.0, position: 9.2 },
      ],
      topPagesByImpressions: [
        { page: "https://example.com/page1", clicks: 200, impressions: 1500, ctr: 13.33, position: 7.5 },
        { page: "https://example.com/page2", clicks: 180, impressions: 1200, ctr: 15.0, position: 9.2 },
      ],
      searchTypeBreakdown: [
        { searchType: "organic", clicks: 1200, impressions: 14000, ctr: 8.57, averagePosition: 12.3 },
        { searchType: "news", clicks: 50, impressions: 1000, ctr: 5.0, averagePosition: 18.5 },
      ],
      richResults: [
        { type: "FAQ", clicks: 100, impressions: 800, ctr: 12.5, averagePosition: 9.2 },
        { type: "HowTo", clicks: 80, impressions: 600, ctr: 13.33, averagePosition: 8.8 },
      ],
      coreWebVitals: undefined
    };
  }
}

export const searchConsoleService = SearchConsoleService.getInstance();
