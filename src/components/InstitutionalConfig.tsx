import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  X, 
  Plus, 
  Check, 
  Users, 
  Phone, 
  Calendar,
  Megaphone,
  GraduationCap,
  Heart,
  Monitor,
  MapPin,
  Building,
  Clock
} from "lucide-react";
import type { InstitutionalConfig as InstitutionalConfigType } from "@/types/persist";

interface InstitutionalConfigProps {
  config: InstitutionalConfigType;
  onChange: (config: InstitutionalConfigType) => void;
}

export function InstitutionalConfig({ config, onChange }: InstitutionalConfigProps) {
  const [inputs, setInputs] = useState({
    buildingName: '',
    programName: '',
    supportCenter: '',
    slogan: '',
    leaderName: '',
    advisorTitle: '',
    staffTitle: '',
    primaryCTA: '',
    secondaryCTA: '',
    urgentCTA: '',
    websiteLink: '',
    socialHandle: '',
    academicTerm: '',
    gradingTerm: '',
    enrollmentTerm: '',
    signatureTemplate: '',
    toneRule: '',
    wordToAvoid: '',
    preferredPhrase: '',
    dateLabel: '',
    datePlaceholder: '',
    campusTerm: '',
  });

  const addToArray = (field: keyof InstitutionalConfigType, inputKey: keyof typeof inputs) => {
    const value = inputs[inputKey].trim();
    if (!value) return;
    
    const currentArray = (config[field] as string[]) || [];
    if (!currentArray.includes(value)) {
      onChange({ ...config, [field]: [...currentArray, value] });
    }
    setInputs({ ...inputs, [inputKey]: '' });
  };

  const removeFromArray = (field: keyof InstitutionalConfigType, value: string) => {
    const currentArray = (config[field] as string[]) || [];
    onChange({ ...config, [field]: currentArray.filter(v => v !== value) });
  };

  const addImportantDate = () => {
    if (!inputs.dateLabel.trim() || !inputs.datePlaceholder.trim()) return;
    const currentDates = config.importantDates || [];
    onChange({
      ...config,
      importantDates: [...currentDates, { label: inputs.dateLabel, placeholder: inputs.datePlaceholder }]
    });
    setInputs({ ...inputs, dateLabel: '', datePlaceholder: '' });
  };

  const removeImportantDate = (label: string) => {
    const currentDates = config.importantDates || [];
    onChange({ ...config, importantDates: currentDates.filter(d => d.label !== label) });
  };

  const renderArrayField = (
    label: string,
    field: keyof InstitutionalConfigType,
    inputKey: keyof typeof inputs,
    placeholder: string,
    hint?: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex gap-2">
        <Input
          value={inputs[inputKey]}
          onChange={(e) => setInputs({ ...inputs, [inputKey]: e.target.value })}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(field, inputKey))}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={() => addToArray(field, inputKey)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {((config[field] as string[]) || []).map((item) => (
          <Badge key={item} variant="secondary" className="gap-1">
            {item}
            <button
              type="button"
              onClick={() => removeFromArray(field, item)}
              className="hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderTextField = (
    label: string,
    field: keyof InstitutionalConfigType,
    placeholder: string,
    hint?: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Input
        value={(config[field] as string) || ''}
        onChange={(e) => onChange({ ...config, [field]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  const hasConfig = Object.values(config).some(v => 
    (Array.isArray(v) && v.length > 0) || (typeof v === 'string' && v.length > 0)
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full mb-6">
          <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
          <TabsTrigger value="systems" className="text-xs">Systems</TabsTrigger>
          <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
          <TabsTrigger value="ctas" className="text-xs">CTAs</TabsTrigger>
          <TabsTrigger value="terms" className="text-xs">Terms</TabsTrigger>
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderTextField('Institution Name', 'institutionName', 'e.g., Lakewood University')}
            {renderTextField('Abbreviation', 'institutionAbbreviation', 'e.g., LU, UK')}
            {renderTextField('Mascot / Nickname', 'mascot', 'e.g., Griffins')}
          </div>
          
          {renderArrayField('Slogans & Spirit Phrases', 'slogans', 'slogan', 'e.g., Go Griffins!', 'Phrases used in communications to build school spirit')}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="contact">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Email Domain', 'emailDomain', 'e.g., @university.edu')}
                  {renderTextField('Primary Contact Email', 'primaryContactEmail', 'e.g., success@university.edu')}
                  {renderTextField('Primary Contact Phone', 'primaryContactPhone', 'e.g., (555) 123-4567')}
                  {renderTextField('Advising Email', 'advisingEmail', 'e.g., advising@university.edu')}
                  {renderTextField('General Help Email', 'generalHelpEmail', 'e.g., help@university.edu')}
                  {renderTextField('Emergency Phone', 'emergencyPhone', 'e.g., (555) 911-0000')}
                  {renderTextField('Text Alert Number', 'textAlertNumber', 'e.g., 55555')}
                  {renderTextField('Appointment Booking Link', 'appointmentLink', 'e.g., calendly.com/advising')}
                </div>
                {renderArrayField('Website Links', 'websiteLinks', 'websiteLink', 'e.g., advising.university.edu')}
                {renderArrayField('Social Media Handles', 'socialMediaHandles', 'socialHandle', 'e.g., @UKStudentSuccess')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Systems Tab */}
        <TabsContent value="systems" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4" />
              Digital Platforms & Systems
            </h4>
            <p className="text-xs text-muted-foreground">Names of systems students interact with - AI will reference these in messages.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Student Portal Name', 'portalName', 'e.g., MyUniversity Portal, Student Hub')}
            {renderTextField('LMS Name', 'lmsName', 'e.g., Canvas, Blackboard, Moodle')}
            {renderTextField('Advising System', 'advisingSystemName', 'e.g., Navigate, Starfish, EAB')}
            {renderTextField('Scheduling System', 'schedulingSystemName', 'e.g., Calendly, Bookings, AppointmentPlus')}
            {renderTextField('Degree Audit System', 'degreeAuditSystem', 'e.g., DegreeWorks, Stellic')}
            {renderTextField('Financial Aid Portal', 'financialAidPortal', 'e.g., Financial Aid Self-Service')}
            {renderTextField('Registration System', 'registrationSystem', 'e.g., Student Registration Portal')}
            {renderTextField('Virtual Meeting Platform', 'virtualMeetingPlatform', 'e.g., Zoom, Teams, Google Meet')}
          </div>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Campus Locations & Offices
            </h4>
            <p className="text-xs text-muted-foreground">Physical locations and office names to include in messages.</p>
          </div>

          {renderArrayField('Building Names', 'buildingNames', 'buildingName', 'e.g., Student Success Center', 'Official names for buildings')}
          {renderArrayField('Program Names', 'programNames', 'programName', 'e.g., First-Year Experience Program')}
          {renderArrayField('Support Centers', 'supportCenters', 'supportCenter', 'e.g., Writing Center, Math Lab')}
          {renderArrayField('Campus Terms', 'campusTerms', 'campusTerm', 'e.g., quad, commons, student union', 'Local campus geography terms')}
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="centers">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Specific Center Names
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Library', 'libraryName', 'e.g., Whitman Library')}
                  {renderTextField('Tutoring Center', 'tutorCenter', 'e.g., Academic Support Center')}
                  {renderTextField('Writing Center', 'writingCenter', 'e.g., Writing Resource Center')}
                  {renderTextField('Math Center', 'mathCenter', 'e.g., Math Tutoring Lab')}
                  {renderTextField('Career Center', 'careerCenter', 'e.g., Career Development Center')}
                  {renderTextField('Counseling Center', 'counselingCenter', 'e.g., Counseling & Psychological Services')}
                  {renderTextField('Health Center', 'healthCenter', 'e.g., Student Health Services')}
                  {renderTextField('Fitness Center', 'fitnessCenter', 'e.g., Recreation Center, The Rec')}
                  {renderTextField('Dining Hall', 'diningHall', 'e.g., Main Dining Hall, The Commons')}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="offices">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Administrative Offices
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Registrar Office', 'registrarOffice', 'e.g., Office of the Registrar')}
                  {renderTextField('Financial Aid Office', 'financialAidOffice', 'e.g., Financial Aid & Scholarships')}
                  {renderTextField('Admissions Office', 'admissionsOffice', 'e.g., Office of Undergraduate Admissions')}
                  {renderTextField('Bursar Office', 'bursarOffice', 'e.g., Bursar & Student Accounts')}
                  {renderTextField('IT Help Desk', 'itHelpDesk', 'e.g., IT Service Desk, Tech Support')}
                  {renderTextField('Housing Office', 'housingOffice', 'e.g., Residence Life, Housing Services')}
                  {renderTextField('Student Affairs', 'studentAffairsOffice', 'e.g., Dean of Students Office')}
                  {renderTextField('International Office', 'internationalOffice', 'e.g., International Student Services')}
                  {renderTextField('Disability Services', 'disabilityServices', 'e.g., Accessibility Resource Center')}
                  {renderTextField('Veterans Services', 'veteransServices', 'e.g., Veterans Resource Center')}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="meeting">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Meeting & Scheduling
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Default Meeting Location', 'defaultMeetingLocation', 'e.g., Advising Center, Room 200')}
                  {renderTextField('Office Hours Format', 'officeHoursFormat', 'e.g., Monday-Friday 8am-5pm')}
                  {renderTextField('Time Zone', 'timeZone', 'e.g., Eastern Time (ET)')}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Naming Conventions
            </h4>
            <p className="text-xs text-muted-foreground">How should messages address students and staff?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Student Addressing</Label>
              <Select
                value={config.studentAddressing || 'first-name'}
                onValueChange={(value: 'first-name' | 'full-name' | 'formal') => 
                  onChange({ ...config, studentAddressing: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-name">First Name (Hi Sarah)</SelectItem>
                  <SelectItem value="full-name">Full Name (Dear Sarah Johnson)</SelectItem>
                  <SelectItem value="formal">Formal (Dear Student)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Staff Addressing</Label>
              <Select
                value={config.staffAddressing || 'first-name'}
                onValueChange={(value: 'first-name' | 'title-last' | 'full-title') => 
                  onChange({ ...config, staffAddressing: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-name">First Name (from John)</SelectItem>
                  <SelectItem value="title-last">Title + Last (Dr. Smith)</SelectItem>
                  <SelectItem value="full-title">Full Title (Dean John Smith)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pronoun Preference</Label>
              <Select
                value={config.pronounPreference || 'they'}
                onValueChange={(value: 'they' | 'he-she' | 'avoid') => 
                  onChange({ ...config, pronounPreference: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="they">They/Them (inclusive)</SelectItem>
                  <SelectItem value="he-she">He/She (traditional)</SelectItem>
                  <SelectItem value="avoid">Avoid pronouns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderTextField('Student ID Term', 'studentIdTerm', 'e.g., Student ID, Banner ID')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Default Advisor Name (placeholder)', 'defaultAdvisorName', 'e.g., Your Academic Advisor')}
          </div>

          {renderArrayField('Leader Names & Titles', 'leaderNames', 'leaderName', 'e.g., President Dr. Jane Smith', 'Key leaders students should know')}
          {renderArrayField('Advisor Titles', 'advisorTitles', 'advisorTitle', 'e.g., Academic Advisor, Success Coach', 'How advisors are titled')}
          {renderArrayField('Staff Role Titles', 'staffTitles', 'staffTitle', 'e.g., Peer Mentor, Resident Advisor', 'Common staff roles')}
          {renderArrayField('Signature Templates', 'signatureTemplates', 'signatureTemplate', 'e.g., Your Student Success Team', 'Standard message sign-offs')}
        </TabsContent>

        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Megaphone className="w-4 h-4" />
              Call-to-Action Library
            </h4>
            <p className="text-xs text-muted-foreground">Pre-approved CTAs ensure consistent, on-brand messaging across all communications.</p>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              {renderArrayField(
                'Primary CTAs', 
                'primaryCTAs', 
                'primaryCTA', 
                'e.g., Schedule your advising appointment today',
                'Main action you want students to take'
              )}
            </div>
            
            <div className="border-l-4 border-secondary pl-4">
              {renderArrayField(
                'Secondary CTAs', 
                'secondaryCTAs', 
                'secondaryCTA', 
                'e.g., Learn more about available resources',
                'Supporting actions or alternatives'
              )}
            </div>
            
            <div className="border-l-4 border-destructive pl-4">
              {renderArrayField(
                'Urgent CTAs', 
                'urgentCTAs', 
                'urgentCTA', 
                'e.g., Act now — deadline is this Friday!',
                'Time-sensitive or critical actions'
              )}
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dates">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Important Date Placeholders
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground">Define date placeholders that can be used in messages (e.g., {"{{registration_deadline}}"})</p>
                <div className="flex gap-2">
                  <Input
                    value={inputs.dateLabel}
                    onChange={(e) => setInputs({ ...inputs, dateLabel: e.target.value })}
                    placeholder="Label (e.g., Registration Deadline)"
                    className="flex-1"
                  />
                  <Input
                    value={inputs.datePlaceholder}
                    onChange={(e) => setInputs({ ...inputs, datePlaceholder: e.target.value })}
                    placeholder="Placeholder (e.g., {{registration_deadline}})"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addImportantDate}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {(config.importantDates || []).map((date) => (
                    <div key={date.label} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{date.label}</Badge>
                        <code className="text-xs bg-background px-2 py-0.5 rounded">{date.placeholder}</code>
                      </div>
                      <button onClick={() => removeImportantDate(date.label)} className="hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4" />
              Academic Terminology
            </h4>
            <p className="text-xs text-muted-foreground">Institution-specific terms to use in generated messages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTextField('Current Term Name', 'currentTermName', 'e.g., Spring 2025')}
            {renderTextField('Next Term Name', 'nextTermName', 'e.g., Fall 2025')}
          </div>

          {renderArrayField(
            'Academic Terms', 
            'academicTerms', 
            'academicTerm', 
            'e.g., credit hours, full-time status, prerequisite',
            'Common academic vocabulary at your institution'
          )}
          
          {renderArrayField(
            'Grading Terms', 
            'gradingTerms', 
            'gradingTerm', 
            'e.g., midterm grade, GPA, academic standing',
            'Grading-related terminology'
          )}
          
          {renderArrayField(
            'Enrollment Terms', 
            'enrollmentTerms', 
            'enrollmentTerm', 
            'e.g., add/drop period, waitlist, course load',
            'Registration and enrollment language'
          )}
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg mb-4">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" />
              Tone & Voice Guidelines
            </h4>
            <p className="text-xs text-muted-foreground">Define the voice and style for all communications.</p>
          </div>

          {renderArrayField(
            'Preferred Phrases', 
            'preferredPhrases', 
            'preferredPhrase', 
            'e.g., "We are here to support you", "Your success matters"',
            'Phrases to encourage in messaging'
          )}
          
          {renderArrayField(
            'Tone Guidelines', 
            'toneRules', 
            'toneRule', 
            'e.g., Always be encouraging, Avoid jargon',
            'Rules for maintaining consistent tone'
          )}
          
          {renderArrayField(
            'Words to Avoid', 
            'wordsToAvoid', 
            'wordToAvoid', 
            'e.g., mandatory, must, failure',
            'Terms that should not appear in messages'
          )}
        </TabsContent>
      </Tabs>

      {hasConfig && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-6">
          <Check className="w-4 h-4 text-green-600" />
          <span>Institutional settings will personalize all AI-generated message outputs.</span>
        </div>
      )}
    </div>
  );
}
