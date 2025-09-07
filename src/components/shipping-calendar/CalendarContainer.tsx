import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CalendarViews from "./CalendarViews";
import EventDetailDialog from "./EventDetailDialog";
import ICalImporter from "./ICalImporter";

type CalendarView = "month" | "week" | "day" | "list";

type ShippingEvent = {
  id: string;
  title: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  startDate: Date;
  endDate: Date;
  account?: string;
  notes?: string;
  tags?: string[];
  categories?: string[];
};

interface CalendarContainerProps {
  events?: ShippingEvent[];
  onEventUpdate?: (event: ShippingEvent) => void;
  onImport?: (source: string, data: string) => Promise<void>;
}

const CalendarContainer = ({
  events = [],
  onEventUpdate = () => {},
  onImport = async () => {},
}: CalendarContainerProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<ShippingEvent | null>(
    null,
  );
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);

  // Sample events if none provided
  const sampleEvents: ShippingEvent[] =
    events.length > 0
      ? events
      : [
          {
            id: "1",
            title: "UPS Delivery - ACME",
            trackingNumber: "1Z999AA1234567890",
            carrier: "UPS",
            status: "in_transit",
            startDate: addDays(new Date(), 1),
            endDate: addDays(new Date(), 1),
            account: "ACME Corp",
            tags: ["priority"],
            categories: ["electronics"],
          },
          {
            id: "2",
            title: "FedEx Shipment - XYZ",
            trackingNumber: "794583957403",
            carrier: "FedEx",
            status: "delivered",
            startDate: new Date(),
            endDate: new Date(),
            account: "XYZ Inc",
            notes: "Delivered to reception",
          },
          {
            id: "3",
            title: "USPS Package - ABC",
            trackingNumber: "9400111202555842349957",
            carrier: "USPS",
            status: "out_for_delivery",
            startDate: addDays(new Date(), -1),
            endDate: addDays(new Date(), -1),
            account: "ABC Ltd",
          },
        ];

  const handlePrevious = () => {
    switch (currentView) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addDays(currentDate, -7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addDays(currentDate, 7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: ShippingEvent) => {
    setSelectedEvent(event);
  };

  const handleEventUpdate = (updatedEvent: ShippingEvent) => {
    onEventUpdate(updatedEvent);
    setSelectedEvent(null);
  };

  const handleImport = async (source: string, data: string) => {
    await onImport(source, data);
    setIsImporterOpen(false);
  };

  const getDateRangeText = () => {
    switch (currentView) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        const weekStart = addDays(currentDate, -currentDate.getDay());
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const getViewRange = () => {
    switch (currentView) {
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      case "week":
        const weekStart = addDays(currentDate, -currentDate.getDay());
        return {
          start: weekStart,
          end: addDays(weekStart, 6),
        };
      case "day":
        return {
          start: currentDate,
          end: currentDate,
        };
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
    }
  };

  return (
    <Card className="w-full h-full bg-background border rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <h2 className="text-xl font-semibold ml-2">{getDateRangeText()}</h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tabs
              value={currentView}
              onValueChange={(value) => setCurrentView(value as CalendarView)}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsImporterOpen(true)}
              title="Import iCal Feed"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <CalendarViews
          view={currentView}
          currentDate={currentDate}
          events={sampleEvents}
          onEventClick={handleEventClick}
          viewRange={getViewRange()}
        />
      </CardContent>

      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleEventUpdate}
        />
      )}

      <ICalImporter
        open={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImport}
      />
    </Card>
  );
};

export default CalendarContainer;
