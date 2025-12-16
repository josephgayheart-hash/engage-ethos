import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp,
  Mail,
  MousePointer,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock
} from "lucide-react";

interface BenchmarkData {
  metric: string;
  yourRate?: number;
  industryAvg: number;
  topPerformers: number;
  description: string;
}

const PerformanceBenchmarks = () => {
  const [selectedAudience, setSelectedAudience] = useState('all');

  // Industry benchmark data for higher education
  const emailBenchmarks: BenchmarkData[] = [
    {
      metric: 'Open Rate',
      yourRate: undefined,
      industryAvg: 28.5,
      topPerformers: 42.0,
      description: 'Percentage of recipients who open your email',
    },
    {
      metric: 'Click Rate',
      yourRate: undefined,
      industryAvg: 4.2,
      topPerformers: 8.5,
      description: 'Percentage of recipients who click a link',
    },
    {
      metric: 'Click-to-Open Rate',
      yourRate: undefined,
      industryAvg: 14.7,
      topPerformers: 22.0,
      description: 'Clicks as percentage of opens (engagement quality)',
    },
    {
      metric: 'Unsubscribe Rate',
      yourRate: undefined,
      industryAvg: 0.2,
      topPerformers: 0.1,
      description: 'Percentage who unsubscribe (lower is better)',
    },
    {
      metric: 'Bounce Rate',
      yourRate: undefined,
      industryAvg: 1.1,
      topPerformers: 0.5,
      description: 'Percentage of undeliverable emails (lower is better)',
    },
  ];

  const smsBenchmarks: BenchmarkData[] = [
    {
      metric: 'Delivery Rate',
      yourRate: undefined,
      industryAvg: 97.0,
      topPerformers: 99.0,
      description: 'Percentage of messages successfully delivered',
    },
    {
      metric: 'Open Rate',
      yourRate: undefined,
      industryAvg: 98.0,
      topPerformers: 99.5,
      description: 'SMS open rates are significantly higher than email',
    },
    {
      metric: 'Response Rate',
      yourRate: undefined,
      industryAvg: 45.0,
      topPerformers: 65.0,
      description: 'Percentage who respond to SMS messages',
    },
    {
      metric: 'Opt-out Rate',
      yourRate: undefined,
      industryAvg: 2.0,
      topPerformers: 1.0,
      description: 'Percentage who opt out (lower is better)',
    },
  ];

  const audienceBenchmarks = {
    prospective: { openRate: 32.5, clickRate: 5.8, responseRate: 12.0 },
    'first-year': { openRate: 35.2, clickRate: 6.2, responseRate: 15.0 },
    continuing: { openRate: 25.0, clickRate: 3.5, responseRate: 8.0 },
    'at-risk': { openRate: 22.0, clickRate: 3.0, responseRate: 6.0 },
    graduate: { openRate: 30.0, clickRate: 4.5, responseRate: 10.0 },
  };

  const bestSendTimes = [
    { day: 'Tuesday', time: '10:00 AM', score: 95 },
    { day: 'Wednesday', time: '2:00 PM', score: 88 },
    { day: 'Thursday', time: '10:00 AM', score: 85 },
    { day: 'Monday', time: '11:00 AM', score: 78 },
    { day: 'Friday', time: '9:00 AM', score: 65 },
  ];

  const BenchmarkCard = ({ data, inverse = false }: { data: BenchmarkData; inverse?: boolean }) => {
    const comparison = data.yourRate !== undefined 
      ? inverse 
        ? data.yourRate < data.industryAvg 
        : data.yourRate > data.industryAvg
      : null;
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">{data.metric}</h3>
              <p className="text-xs text-muted-foreground mt-1">{data.description}</p>
            </div>
            {comparison !== null && (
              <Badge variant={comparison ? 'default' : 'destructive'} className="flex items-center gap-1">
                {comparison ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {comparison ? 'Above Avg' : 'Below Avg'}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {data.yourRate !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Rate</span>
                  <span className="font-bold text-primary">{data.yourRate}%</span>
                </div>
                <Progress value={(data.yourRate / data.topPerformers) * 100} className="h-2" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{data.industryAvg}%</div>
                <div className="text-xs text-muted-foreground">Industry Avg</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.topPerformers}%</div>
                <div className="text-xs text-muted-foreground">Top Performers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-primary" />
                Performance Benchmarks
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare your metrics against higher education industry standards
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">28.5%</p>
                    <p className="text-xs text-muted-foreground">Avg Email Open</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <MousePointer className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.2%</p>
                    <p className="text-xs text-muted-foreground">Avg Click Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-muted-foreground">SMS Open Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Tue 10am</p>
                    <p className="text-xs text-muted-foreground">Best Send Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="email" className="space-y-6">
            <TabsList>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Benchmarks
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                SMS Benchmarks
              </TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                By Audience
              </TabsTrigger>
              <TabsTrigger value="timing" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Send Times
              </TabsTrigger>
            </TabsList>

            {/* Email Benchmarks */}
            <TabsContent value="email">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailBenchmarks.map((benchmark) => (
                  <BenchmarkCard 
                    key={benchmark.metric} 
                    data={benchmark} 
                    inverse={benchmark.metric.includes('Unsubscribe') || benchmark.metric.includes('Bounce')}
                  />
                ))}
              </div>
            </TabsContent>

            {/* SMS Benchmarks */}
            <TabsContent value="sms">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smsBenchmarks.map((benchmark) => (
                  <BenchmarkCard 
                    key={benchmark.metric} 
                    data={benchmark}
                    inverse={benchmark.metric.includes('Opt-out')}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Audience Benchmarks */}
            <TabsContent value="audience">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Benchmarks by Audience Segment</CardTitle>
                  <CardDescription>
                    Different student populations engage differently with communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Audience</th>
                          <th className="text-center py-3 px-4 font-medium">Open Rate</th>
                          <th className="text-center py-3 px-4 font-medium">Click Rate</th>
                          <th className="text-center py-3 px-4 font-medium">Response Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(audienceBenchmarks).map(([audience, rates]) => (
                          <tr key={audience} className="border-b last:border-0">
                            <td className="py-3 px-4 capitalize font-medium">{audience.replace('-', ' ')}</td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={rates.openRate >= 30 ? 'default' : 'secondary'}>
                                {rates.openRate}%
                              </Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={rates.clickRate >= 5 ? 'default' : 'secondary'}>
                                {rates.clickRate}%
                              </Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={rates.responseRate >= 10 ? 'default' : 'secondary'}>
                                {rates.responseRate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Send Times */}
            <TabsContent value="timing">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Best Send Times</CardTitle>
                    <CardDescription>
                      Optimal times for higher education email engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bestSendTimes.map((time, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{time.day} @ {time.time}</span>
                              <span className="text-sm text-muted-foreground">{time.score}% effectiveness</span>
                            </div>
                            <Progress value={time.score} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">Timing Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">Morning</Badge>
                        <span>9-11 AM has highest engagement for academic messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">Afternoon</Badge>
                        <span>2-4 PM works well for event announcements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">Avoid</Badge>
                        <span>Weekends and after 6 PM for academic communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">SMS</Badge>
                        <span>10 AM - 2 PM for time-sensitive SMS messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">Deadlines</Badge>
                        <span>Send reminders 48h, 24h, and day-of for important deadlines</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Data Source */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Data Sources:</strong> Benchmarks compiled from industry reports including Mailchimp, Campaign Monitor, 
                and higher education-specific research. Individual results may vary based on institution size, 
                audience engagement, and communication frequency.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PerformanceBenchmarks;
