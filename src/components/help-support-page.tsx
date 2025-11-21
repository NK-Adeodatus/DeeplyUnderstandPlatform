import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { HelpCircle, Mail, MessageSquare, Book, Video, FileText } from "lucide-react";
import { toast } from "sonner";

export function HelpSupportPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Support request submitted. We'll get back to you soon!");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container py-8 px-4">
          <h1 className="mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>
      </div>

      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      How do I create a high-quality explanation?
                    </AccordionTrigger>
                    <AccordionContent>
                      Focus on explaining the internal workings and mechanisms rather than just how to use something. 
                      Include code examples, break down complex concepts, and cite your sources. The community values 
                      deep technical explanations that help others truly understand how things work under the hood.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      What makes TechDeep different from other platforms?
                    </AccordionTrigger>
                    <AccordionContent>
                      TechDeep is specifically designed for African software engineering students and professionals 
                      who want to go beyond surface-level tutorials. We focus on deep technical understanding and 
                      encourage explanations of internal mechanisms, not just usage guides.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      Can I save my work as a draft?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes! When creating a post, you can click the "Save Draft" button to save your work and come 
                      back to it later. Your drafts are stored privately and can be accessed from your profile.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      How does the upvoting system work?
                    </AccordionTrigger>
                    <AccordionContent>
                      Community members can upvote explanations they find valuable. Posts with more upvotes appear 
                      higher in the "Top Rated" feed. You need to be signed in to upvote content, and you can toggle 
                      your upvote on or off at any time.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      How can I filter content by category?
                    </AccordionTrigger>
                    <AccordionContent>
                      Use the category filters on the Explore page or click on any category in the sidebar. We have 
                      categories for Web Development, Programming Languages, Databases, Frameworks & Libraries, 
                      DevOps & Infrastructure, Security, and Data Structures & Algorithms.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>
                      What should I do if I find inappropriate content?
                    </AccordionTrigger>
                    <AccordionContent>
                      We take community standards seriously. If you encounter inappropriate content, please use the 
                      contact form below to report it to our moderation team. Include the post title and a brief 
                      description of the issue.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>
                      Can I edit my posts after publishing?
                    </AccordionTrigger>
                    <AccordionContent>
                      Currently, you can delete your posts if needed. Post editing functionality is coming soon. 
                      In the meantime, if you need to make significant changes, you can delete the original and 
                      create an updated version.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>
                      How do I change my profile information?
                    </AccordionTrigger>
                    <AccordionContent>
                      Go to Settings from the sidebar menu and navigate to the Profile tab. Here you can update 
                      your name, country, bio, website, and other personal information. Don't forget to click 
                      "Save Changes" when you're done.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Book className="h-4 w-4" />
                  User Guide
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Video className="h-4 w-4" />
                  Video Tutorials
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Documentation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@techdeep.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm">Community Forum</p>
                    <p className="text-sm text-muted-foreground">
                      Ask the community
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We typically respond to support requests within 24-48 hours. 
                  For urgent issues, please mark your request as "Urgent" in the subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}