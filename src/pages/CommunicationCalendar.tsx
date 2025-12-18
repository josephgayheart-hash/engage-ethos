import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMessageLibrary } from "@/hooks/useMessageLibrary";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Globe,
  Layout,
  Phone,
  Megaphone
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

const channelIcons: Record<string, typeof Mail> = {
  'email': Mail,
  'sms': MessageSquare,
  'portal': Layout,
  'landing-page': Globe,
  'social-media': Megaphone,
  'phone': Phone,
};

const channelColors: Record<string, string> = {
  'email': 'bg-blue-500',
  'sms': 'bg-green-500',
  'portal': 'bg-purple-500',
  'landing-page': 'bg-orange-500',
  'social-media': 'bg-pink-500',
  'phone': 'bg-yellow-500',
};

const CommunicationCalendar = () => {
  const { messages } = useMessageLibrary();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  // Get campaigns from localStorage
  const campaigns = useMemo(() => {
    const saved = localStorage.getItem('uplaybook_campaigns');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Filter messages based on selections
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (selectedAudience !== 'all' && msg.audience !== selectedAudience) return false;
      if (selectedChannel !== 'all' && msg.channel !== selectedChannel) return false;
      return true;
    });
  }, [messages, selectedAudience, selectedChannel]);

  // Get messages for a specific date
  const getMessagesForDate = (date: Date) => {
    return filteredMessages.filter(msg => {
      const msgDate = new Date(msg.createdAt);
      return isSameDay(msgDate, date);
    });
  };

  // Calendar grid calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Stats for the month
  const monthMessages = filteredMessages.filter(msg => {
    const msgDate = new Date(msg.createdAt);
    return msgDate >= monthStart && msgDate <= monthEnd;
  });

  const channelBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    monthMessages.forEach(msg => {
      const channel = msg.channel || 'unknown';
      breakdown[channel] = (breakdown[channel] || 0) + 1;
    });
    return breakdown;
  }, [monthMessages]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <CalendarIcon className="w-7 h-7 text-primary" />
                  Communication Calendar
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualize your messaging timeline to prevent audience fatigue
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Audience</label>
                    <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Audiences</SelectItem>
                        <SelectItem value="prospective">Prospective</SelectItem>
                        <SelectItem value="first-year">First-Year</SelectItem>
                        <SelectItem value="continuing">Continuing</SelectItem>
                        <SelectItem value="at-risk">At-Risk</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Channel</label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Month Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {format(currentMonth, 'MMMM yyyy')} Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Messages</span>
                      <span className="font-semibold">{monthMessages.length}</span>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      {Object.entries(channelBreakdown).map(([channel, count]) => {
                        const Icon = channelIcons[channel] || Mail;
                        return (
                          <div key={channel} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${channelColors[channel] || 'bg-gray-500'}`} />
                              <span className="text-sm capitalize">{channel}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Channel Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(channelColors).map(([channel, color]) => {
                      const Icon = channelIcons[channel];
                      return (
                        <div key={channel} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${color}`} />
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{channel}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="font-serif text-xl font-semibold min-w-[200px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h2>
                      <Button variant="outline" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      const dayMessages = getMessagesForDate(day);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div
                          key={idx}
                          className={`min-h-[100px] p-2 rounded-lg border ${
                            isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                          } ${isToday ? 'border-primary' : 'border-border'}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isCurrentMonth ? '' : 'text-muted-foreground'
                          } ${isToday ? 'text-primary' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayMessages.slice(0, 3).map((msg, i) => {
                              const Icon = channelIcons[msg.channel || 'email'] || Mail;
                              return (
                                <div
                                  key={i}
                                  className={`text-xs p-1 rounded flex items-center gap-1 ${
                                    channelColors[msg.channel || 'email']
                                  } text-white truncate`}
                                  title={msg.title}
                                >
                                  <Icon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{msg.title.slice(0, 15)}</span>
                                </div>
                              );
                            })}
                            {dayMessages.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayMessages.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunicationCalendar;
