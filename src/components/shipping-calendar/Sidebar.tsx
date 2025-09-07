import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  Package,
  Calendar,
  Plus,
  Import,
  Menu,
  X,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewEvent?: () => void;
  onImportICal?: () => void;
  events?: ShippingEvent[];
  onEventClick?: (event: ShippingEvent) => void;
  currentDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const Sidebar = ({
  isOpen = true,
  onClose,
  onNewEvent,
  onImportICal,
  events = [],
  onEventClick,
  currentDate = new Date(),
  onDateSelect,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState({
    personal: true,
    work: true,
    shipments: true,
  });

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
            startDate: new Date(),
            endDate: new Date(),
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
          },
          {
            id: "3",
            title: "USPS Package - ABC",
            trackingNumber: "9400111202555842349957",
            carrier: "USPS",
            status: "out_for_delivery",
            startDate: new Date(),
            endDate: new Date(),
            account: "ABC Ltd",
          },
        ];

  const displayEvents = events.length > 0 ? events : sampleEvents;

  // Filter events based on search query
  const filteredEvents = displayEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.carrier.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get carrier color class
  const getCarrierColorClass = (carrier: string) => {
    const carrierColors: Record<string, string> = {
      ups: "event-ups",
      fedex: "event-fedex",
      usps: "event-usps",
      dhl: "event-dhl",
    };
    return carrierColors[carrier.toLowerCase()] || "event-default";
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    const statusColors: Record<string, string> = {
      delivered: "status-delivered",
      in_transit: "status-in-transit",
      pending: "status-pending",
      delayed: "status-delayed",
      out_for_delivery: "status-in-transit",
    };
    return statusColors[status] || "status-pending";
  };

  // Mini calendar
  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div className="bg-muted/30 p-4 rounded-lg mb-6">
        <p className="text-center text-sm font-medium text-muted-foreground mb-3">
          {format(currentDate, "MMMM yyyy")}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {dayNames.map((day, i) => (
            <span key={i} className="text-muted-foreground font-medium py-1">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((day, dayIdx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayEvents = displayEvents.filter((event) => {
              const eventDate =
                event.startDate instanceof Date
                  ? event.startDate
                  : new Date(event.startDate);
              return (
                format(eventDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
              );
            });

            return (
              <button
                key={dayIdx}
                onClick={() => onDateSelect && onDateSelect(day)}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-accent",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday(day) &&
                    "bg-primary text-primary-foreground font-semibold",
                  dayEvents.length > 0 &&
                    !isToday(day) &&
                    "bg-muted text-foreground font-medium",
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const toggleCalendar = (calendar: keyof typeof selectedCalendars) => {
    setSelectedCalendars((prev) => ({
      ...prev,
      [calendar]: !prev[calendar],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-card border-r border-border p-6 flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">XanTrack</h1>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* New Event Button */}
        <Button
          onClick={onNewEvent}
          className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Event
        </Button>

        {/* Mini Calendar */}
        {renderMiniCalendar()}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Calendar Filters */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            My Calendars
          </h2>
          <div className="space-y-2">
            <div
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => toggleCalendar("personal")}
            >
              <input
                type="checkbox"
                checked={selectedCalendars.personal}
                onChange={() => toggleCalendar("personal")}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm font-medium">Personal</span>
            </div>
            <div
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => toggleCalendar("work")}
            >
              <input
                type="checkbox"
                checked={selectedCalendars.work}
                onChange={() => toggleCalendar("work")}
                className="w-4 h-4 rounded border-border text-green-500 focus:ring-green-500 focus:ring-offset-0"
              />
              <span className="text-sm font-medium">Work</span>
            </div>
            <div
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => toggleCalendar("shipments")}
            >
              <input
                type="checkbox"
                checked={selectedCalendars.shipments}
                onChange={() => toggleCalendar("shipments")}
                className="w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm font-medium">Shipments</span>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Recent Events */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            Recent Events
          </h2>
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {filteredEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event)}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                      getCarrierColorClass(event.carrier),
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.trackingNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs px-2 py-0.5",
                          getStatusColorClass(event.status),
                        )}
                      >
                        {event.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.carrier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events found</p>
              </div>
            )}
          </div>
        </div>

        {/* Import iCal Button */}
        <Button
          variant="outline"
          onClick={onImportICal}
          className="w-full mt-4 border-border hover:bg-secondary"
        >
          <Import className="w-5 h-5 mr-2" />
          Add iCal Feed
        </Button>
      </aside>
    </>
  );
};

export default Sidebar;
