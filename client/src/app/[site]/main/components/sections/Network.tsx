"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/basic-tabs";
import { Card, CardContent } from "../../../../../components/ui/card";
import { useSubdivisions } from "../../../../../lib/geo";
import { StandardSection } from "../../../components/shared/StandardSection/StandardSection";
import { Expand } from "lucide-react";
import { Button } from "../../../../../components/ui/button";

type Tab =
  | "vpn"
  | "crawler"
  | "datacenter"
  | "company"
  | "company_type"
  | "company_domain"
  | "asn_org"
  | "asn_type"
  | "asn_domain";

export function Network() {
  const [tab, setTab] = useState<Tab>("vpn");
  const [expanded, setExpanded] = useState(false);
  const close = () => {
    setExpanded(false);
  };

  return (
    <Card className="h-[405px]">
      <CardContent className="mt-2">
        <Tabs defaultValue="vpn" value={tab} onValueChange={value => setTab(value as Tab)}>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="vpn">VPN</TabsTrigger>
                <TabsTrigger value="crawler">Crawler</TabsTrigger>
                <TabsTrigger value="datacenter">Datacenter</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="company_type">Company Type</TabsTrigger>
                <TabsTrigger value="company_domain">Company Domain</TabsTrigger>
                <TabsTrigger value="asn_org">ASN Org</TabsTrigger>
                <TabsTrigger value="asn_type">ASN Type</TabsTrigger>
                <TabsTrigger value="asn_domain">ASN Domain</TabsTrigger>
              </TabsList>
            </div>
            <div className="w-10">
              <Button size="smIcon" onClick={() => setExpanded(!expanded)}>
                <Expand />
              </Button>
            </div>
          </div>
          <TabsContent value="vpn">
            <StandardSection
              filterParameter="vpn"
              title="VPN"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="crawler">
            <StandardSection
              filterParameter="crawler"
              title="Crawler"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="datacenter">
            <StandardSection
              filterParameter="datacenter"
              title="Datacenter"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="company">
            <StandardSection
              filterParameter="company"
              title="Company"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="company_type">
            <StandardSection
              filterParameter="company_type"
              title="Company Type"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="company_domain">
            <StandardSection
              filterParameter="company_domain"
              title="Company Domain"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="asn_org">
            <StandardSection
              filterParameter="asn_org"
              title="ASN Org"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="asn_type">
            <StandardSection
              filterParameter="asn_type"
              title="ASN Type"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
          <TabsContent value="asn_domain">
            <StandardSection
              filterParameter="asn_domain"
              title="ASN Domain"
              getValue={e => e.value}
              getKey={e => e.value}
              getFilterLabel={e => e.value}
              expanded={expanded}
              close={close}
              getLabel={e => e.value}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
