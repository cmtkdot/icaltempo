import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  InfoIcon,
  LinkIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
} from "lucide-react";

interface ICalImporterProps {
  onImport?: (source: string, data: string | URL) => Promise<void>;
  isImporting?: boolean;
  importResult?: {
    success: boolean;
    message: string;
    eventsCount?: number;
    duplicatesCount?: number;
  };
}

const ICalImporter = ({
  onImport = async () => {},
  isImporting = false,
  importResult = null,
}: ICalImporterProps) => {
  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("");
  const [icalText, setIcalText] = useState("");

  const handleImport = () => {
    if (activeTab === "url" && url) {
      onImport("url", url);
    } else if (activeTab === "text" && icalText) {
      onImport("text", icalText);
    }
  };

  return (
    <Card className="w-full max-w-md bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5" />
          Import iCal Feed
        </CardTitle>
        <CardDescription>
          Import shipping events from Parcel App or other iCal sources
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Paste iCal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="ical-url" className="text-sm font-medium">
                iCal Feed URL
              </label>
              <Input
                id="ical-url"
                placeholder="https://example.com/calendar.ics"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isImporting}
              />
            </div>

            <Alert variant="outline" className="bg-muted/50">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Parcel App Integration</AlertTitle>
              <AlertDescription>
                To import from Parcel App, go to Settings → Calendar
                Subscriptions and copy the iCal URL.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="text" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="ical-text" className="text-sm font-medium">
                Paste iCal Content
              </label>
              <Textarea
                id="ical-text"
                placeholder="BEGIN:VCALENDAR..."
                value={icalText}
                onChange={(e) => setIcalText(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
                disabled={isImporting}
              />
            </div>
          </TabsContent>
        </Tabs>

        {isImporting && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Importing events...</span>
              <LoaderIcon className="h-4 w-4 animate-spin" />
            </div>
            <Progress value={45} className="h-1" />
          </div>
        )}

        {importResult && (
          <div className="mt-6">
            <Separator className="my-4" />
            <div
              className={`rounded-md p-4 ${importResult.success ? "bg-success/10" : "bg-destructive/10"}`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-destructive" />
                )}
                <div className="space-y-2">
                  <p className="font-medium">
                    {importResult.success
                      ? "Import Successful"
                      : "Import Failed"}
                  </p>
                  <p className="text-sm">{importResult.message}</p>

                  {importResult.success &&
                    importResult.eventsCount !== undefined && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline" className="bg-background">
                          {importResult.eventsCount} events imported
                        </Badge>
                        {importResult.duplicatesCount !== undefined &&
                          importResult.duplicatesCount > 0 && (
                            <Badge variant="outline" className="bg-background">
                              {importResult.duplicatesCount} duplicates skipped
                            </Badge>
                          )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" disabled={isImporting}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={
            isImporting ||
            (activeTab === "url" && !url) ||
            (activeTab === "text" && !icalText)
          }
        >
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ICalImporter;
