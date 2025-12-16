import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useInstitutionalConfig } from "@/hooks/useInstitutionalConfig";
import { 
  ArrowLeft, 
  Monitor,
  Smartphone,
  Mail,
  Eye
} from "lucide-react";

const EmailPreview = () => {
  const { config } = useInstitutionalConfig();
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState(config?.institutionName || "University");
  const [senderEmail, setSenderEmail] = useState("noreply@university.edu");

  const renderEmailContent = () => {
    return content.split('\n').map((line, i) => {
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} style={{ margin: '0 0 12px 0' }}>{line}</p>;
    });
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
                <Eye className="w-7 h-7 text-primary" />
                Email Preview
              </h1>
              <p className="text-muted-foreground mt-1">
                See how your email looks across different clients and devices
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Email Content</CardTitle>
                  <CardDescription>
                    Enter your email details to preview rendering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sender Name</Label>
                      <Input
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sender Email</Label>
                      <Input
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="noreply@university.edu"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                    <div className="text-xs text-muted-foreground">
                      {subject.length} / 60 characters (recommended)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Text (Preheader)</Label>
                    <Input
                      value={preheader}
                      onChange={(e) => setPreheader(e.target.value)}
                      placeholder="Brief preview text..."
                    />
                    <div className="text-xs text-muted-foreground">
                      {preheader.length} / 90 characters (recommended)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your email content..."
                      rows={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="desktop">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="desktop" className="flex items-center gap-1">
                        <Monitor className="w-4 h-4" />
                        Desktop
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        Mobile
                      </TabsTrigger>
                      <TabsTrigger value="gmail">Gmail</TabsTrigger>
                      <TabsTrigger value="outlook">Outlook</TabsTrigger>
                    </TabsList>

                    {/* Desktop Preview */}
                    <TabsContent value="desktop" className="mt-4">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        {/* Inbox Row */}
                        <div className="p-4 border-b bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                              {senderName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{senderName}</span>
                                <span className="text-sm text-gray-500">&lt;{senderEmail}&gt;</span>
                                <span className="text-sm text-gray-400 ml-auto">10:30 AM</span>
                              </div>
                              <div className="font-medium text-gray-900 truncate">
                                {subject || 'No subject'}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {preheader || content.slice(0, 100) || 'No preview text'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Email Body */}
                        <div className="p-6" style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
                          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h1 style={{ margin: '0 0 20px', fontSize: '24px', color: '#333' }}>
                              {subject || 'Email Subject'}
                            </h1>
                            <div>
                              {content ? renderEmailContent() : (
                                <p style={{ color: '#666' }}>Your email content will appear here...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Mobile Preview */}
                    <TabsContent value="mobile" className="mt-4">
                      <div className="max-w-[375px] mx-auto">
                        <div className="border rounded-2xl overflow-hidden bg-white shadow-lg">
                          {/* Mobile Header */}
                          <div className="bg-gray-100 px-4 py-2 flex items-center justify-center text-xs text-gray-500">
                            9:41 AM
                          </div>
                          
                          {/* Inbox Row */}
                          <div className="p-3 border-b">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                                {senderName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm text-gray-900">{senderName}</span>
                                  <span className="text-xs text-gray-400">10:30</span>
                                </div>
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {subject.slice(0, 35) || 'No subject'}
                                  {subject.length > 35 && '...'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {preheader.slice(0, 50) || content.slice(0, 50) || 'No preview'}
                                  {(preheader.length > 50 || content.length > 50) && '...'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Email Body */}
                          <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.5', fontSize: '14px' }}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>
                              {subject || 'Email Subject'}
                            </h2>
                            <div>
                              {content ? renderEmailContent() : (
                                <p style={{ color: '#666', fontSize: '14px' }}>Content preview...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Gmail Preview */}
                    <TabsContent value="gmail" className="mt-4">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <div className="bg-[#f6f8fc] px-4 py-3 border-b flex items-center gap-4">
                          <Mail className="w-5 h-5 text-[#5f6368]" />
                          <span className="text-sm text-[#5f6368]">Gmail</span>
                        </div>
                        <div className="p-4 border-b">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium">
                              {senderName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{senderName}</span>
                                <span className="text-sm text-[#5f6368]">&lt;{senderEmail}&gt;</span>
                              </div>
                              <div className="text-xs text-[#5f6368]">to me</div>
                            </div>
                            <span className="text-xs text-[#5f6368] ml-auto">10:30 AM</span>
                          </div>
                          <h2 className="text-xl font-normal text-[#202124] mb-4">
                            {subject || 'No subject'}
                          </h2>
                        </div>
                        <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', color: '#202124', lineHeight: '1.5' }}>
                          {content ? renderEmailContent() : (
                            <p style={{ color: '#5f6368' }}>Email content...</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Outlook Preview */}
                    <TabsContent value="outlook" className="mt-4">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <div className="bg-[#0078d4] px-4 py-3 flex items-center gap-4">
                          <Mail className="w-5 h-5 text-white" />
                          <span className="text-sm text-white font-medium">Outlook</span>
                        </div>
                        <div className="p-4 bg-[#f3f2f1] border-b">
                          <div className="font-semibold text-[#323130] mb-1">
                            {subject || 'No subject'}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-full bg-[#0078d4] text-white flex items-center justify-center text-xs font-medium">
                              {senderName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-[#323130]">{senderName}</div>
                              <div className="text-xs text-[#605e5c]">{senderEmail}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', color: '#323130', lineHeight: '1.5' }}>
                          {content ? renderEmailContent() : (
                            <p style={{ color: '#605e5c' }}>Email content...</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Rendering Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Keep subject lines under 60 characters</li>
                    <li>• Preview text shows after subject in most clients</li>
                    <li>• Gmail clips emails over 102KB</li>
                    <li>• Outlook may block images by default</li>
                    <li>• Test with real content before sending</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailPreview;
