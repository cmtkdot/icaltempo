import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Search,
  User,
} from "lucide-react";
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
import Sidebar from "./Sidebar";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewEvent={() => console.log("New event")}
        onImportICal={() => setIsImporterOpen(true)}
        events={sampleEvents}
        onEventClick={handleEventClick}
        currentDate={currentDate}
        onDateSelect={setCurrentDate}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-card border-b border-border flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-muted-foreground"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground">
              {getDateRangeText()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={currentView}
              onValueChange={(value) => setCurrentView(value as CalendarView)}
              className="hidden md:block"
            >
              <TabsList className="bg-secondary p-1">
                <TabsTrigger value="day" className="px-3 py-1 text-sm">
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="px-3 py-1 text-sm">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="px-3 py-1 text-sm">
                  Month
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3 py-1 text-sm">
                  Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Calendar Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
          <CalendarViews
            view={currentView}
            currentDate={currentDate}
            events={sampleEvents}
            onEventClick={handleEventClick}
            viewRange={getViewRange()}
          />
        </div>
      </main>

      {/* Mobile FAB */}
      <Button
        onClick={() => console.log("New event")}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-30"
        size="icon"
      >
        <Plus className="w-8 h-8" />
      </Button>

      {/* Dialogs */}
      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSave={handleEventUpdate}
        />
      )}

      <ICalImporter
        open={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default CalendarContainer;
