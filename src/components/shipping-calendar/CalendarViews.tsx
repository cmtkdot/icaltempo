import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addDays,
  getDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ShippingEvent = {
  id: string;
  title: string;
  date: Date;
  carrier: string;
  status: string;
  trackingNumber: string;
  accountName?: string;
};

type CalendarViewsProps = {
  events?: ShippingEvent[];
  onEventClick?: (event: ShippingEvent) => void;
  onDateSelect?: (date: Date) => void;
};

const CalendarViews = ({
  events = [],
  onEventClick,
  onDateSelect,
}: CalendarViewsProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState("month");

  // Sample events if none provided
  const sampleEvents: ShippingEvent[] =
    events.length > 0
      ? events
      : [
          {
            id: "1",
            title: "UPS Delivery - ACME",
            date: new Date(),
            carrier: "ups",
            status: "inTransit",
            trackingNumber: "1Z999AA1234567890",
          },
          {
            id: "2",
            title: "FedEx Pickup - XYZ Corp",
            date: addDays(new Date(), 1),
            carrier: "fedex",
            status: "pending",
            trackingNumber: "794583957684",
          },
          {
            id: "3",
            title: "USPS Delivery - ABC Inc",
            date: addDays(new Date(), -1),
            carrier: "usps",
            status: "delivered",
            trackingNumber: "9400111899562537279742",
          },
        ];

  const displayEvents = events.length > 0 ? events : sampleEvents;

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get carrier color
  const getCarrierColor = (carrier: string) => {
    const carrierColors: Record<string, string> = {
      ups: "bg-orange-500 border-orange-600",
      fedex: "bg-purple-500 border-purple-600",
      usps: "bg-blue-500 border-blue-600",
      dhl: "bg-yellow-500 border-yellow-600",
    };
    return (
      carrierColors[carrier.toLowerCase()] || "bg-gray-500 border-gray-600"
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      delivered: "bg-green-500",
      inTransit: "bg-blue-500",
      pending: "bg-gray-400",
      delayed: "bg-red-500",
      out_for_delivery: "bg-blue-500",
    };
    return statusColors[status] || "bg-gray-400";
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "MMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Group events by date
    const eventsByDate: Record<string, ShippingEvent[]> = {};
    displayEvents.forEach((event) => {
      // Validate date before formatting
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return; // Skip invalid dates
      }
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    return (
      <div className="bg-background">
        <div className="grid grid-cols-7 gap-px">
          {dayNames.map((day, i) => (
            <div key={i} className="h-10 text-center py-2 font-medium text-sm">
              {day}
            </div>
          ))}

          {days.map((day, dayIdx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div
                key={dayIdx}
                className={cn(
                  "h-36 p-1.5 border-r border-b border-border cursor-pointer transition-colors hover:bg-muted/30",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday(day) && "bg-primary/5",
                )}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <span
                  className={cn(
                    "text-sm font-medium cursor-pointer",
                    isToday(day) &&
                      "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    !isCurrentMonth && "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1 max-h-[100px] overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-xs p-1.5 rounded-md cursor-pointer transition-all hover:scale-105 hover:shadow-sm",
                        getCarrierColor(event.carrier),
                        "text-white font-medium",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick && onEventClick(event);
                      }}
                    >
                      <p className="font-semibold truncate">
                        {event.carrier} Delivery
                      </p>
                      <p className="truncate opacity-90">
                        #{event.trackingNumber.slice(-8)}
                      </p>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-2 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(weekStart);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Group events by date and hour
    const eventsByDateHour: Record<
      string,
      Record<number, ShippingEvent[]>
    > = {};
    displayEvents.forEach((event) => {
      // Validate date before formatting
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return; // Skip invalid dates
      }
      const dateKey = format(eventDate, "yyyy-MM-dd");
      const hour = eventDate.getHours();

      if (!eventsByDateHour[dateKey]) {
        eventsByDateHour[dateKey] = {};
      }
      if (!eventsByDateHour[dateKey][hour]) {
        eventsByDateHour[dateKey][hour] = [];
      }
      eventsByDateHour[dateKey][hour].push(event);
    });

    return (
      <div className="bg-background overflow-auto">
        <div className="grid grid-cols-8 gap-px">
          {/* Time column */}
          <div className="border-r border-border">
            <div className="h-12"></div> {/* Empty cell for header alignment */}
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-t border-border px-2 py-1">
                <span className="text-xs text-muted-foreground">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {days.map((day, dayIdx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            return (
              <div key={dayIdx} className="flex-1">
                {/* Day header */}
                <div
                  className={cn(
                    "h-12 flex flex-col items-center justify-center border-b border-border",
                    isToday(day) && "bg-muted/50",
                  )}
                >
                  <div className="text-sm font-medium">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "text-sm",
                      isToday(day) &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>

                {/* Hour cells */}
                {hours.map((hour) => {
                  const hourEvents = eventsByDateHour[dateKey]?.[hour] || [];
                  return (
                    <div
                      key={hour}
                      className="h-16 border-t border-border relative"
                      onClick={() => {
                        const selectedDate = new Date(day);
                        selectedDate.setHours(hour);
                        onDateSelect && onDateSelect(selectedDate);
                      }}
                    >
                      {hourEvents.map((event, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "absolute left-0 right-0 mx-1 px-2 py-1 text-xs rounded truncate",
                            getCarrierColor(event.carrier),
                            "text-white",
                            "top-0",
                          )}
                          style={{ top: `${idx * 20}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick && onEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateKey = format(currentDate, "yyyy-MM-dd");

    // Filter events for the current day
    const dayEvents = displayEvents.filter((event) => {
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return false; // Skip invalid dates
      }
      return format(eventDate, "yyyy-MM-dd") === dateKey;
    });

    // Group events by hour
    const eventsByHour: Record<number, ShippingEvent[]> = {};
    dayEvents.forEach((event) => {
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return; // Skip invalid dates
      }
      const hour = eventDate.getHours();
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push(event);
    });

    return (
      <div className="bg-background overflow-auto">
        <div className="flex flex-col">
          {hours.map((hour) => {
            const hourEvents = eventsByHour[hour] || [];
            return (
              <div key={hour} className="flex border-t border-border">
                <div className="w-16 py-2 px-2 text-xs text-muted-foreground">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </div>
                <div
                  className="flex-1 min-h-[60px] relative"
                  onClick={() => {
                    const selectedDate = new Date(currentDate);
                    selectedDate.setHours(hour);
                    onDateSelect && onDateSelect(selectedDate);
                  }}
                >
                  {hourEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "mx-1 my-1 px-3 py-2 rounded",
                        getCarrierColor(event.carrier),
                        "text-white",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick && onEventClick(event);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {event.trackingNumber}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List/Agenda View
  const renderListView = () => {
    // Group events by date
    const eventsByDate: Record<string, ShippingEvent[]> = {};
    displayEvents.forEach((event) => {
      // Validate date before formatting
      const eventDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        console.warn("Invalid date found in event:", event);
        return; // Skip invalid dates
      }
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    // Sort dates
    const sortedDates = Object.keys(eventsByDate).sort();

    return (
      <div className="bg-background space-y-4 p-2">
        {sortedDates.length > 0 ? (
          sortedDates.map((dateKey) => {
            const date = new Date(dateKey);
            const events = eventsByDate[dateKey];
            return (
              <div key={dateKey} className="space-y-2">
                <div
                  className={cn(
                    "sticky top-0 bg-background z-10 py-2 font-medium",
                    isToday(date) && "text-primary",
                  )}
                >
                  {isToday(date) ? "Today" : format(date, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="space-y-2">
                  {events.map((event, idx) => {
                    const eventDate =
                      event.date instanceof Date
                        ? event.date
                        : new Date(event.date);
                    const timeDisplay = isNaN(eventDate.getTime())
                      ? "Invalid time"
                      : format(eventDate, "h:mm a");

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-lg bg-card shadow-sm hover:shadow-md transition-all cursor-pointer border border-border/50"
                        onClick={() => onEventClick && onEventClick(event)}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-16 rounded-full flex-shrink-0",
                            getCarrierColor(event.carrier),
                          )}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {timeDisplay}
                          </p>
                          <p className="text-sm mt-1 truncate font-mono text-xs bg-muted/50 px-2 py-1 rounded">
                            #{event.trackingNumber}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            getStatusColor(event.status),
                            "text-white",
                          )}
                        >
                          {event.status.replace("_", " ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No shipping events found
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background">
      {/* Desktop: Month Grid */}
      <div className="hidden md:grid grid-cols-7 border-l border-t border-border rounded-lg overflow-hidden shadow-lg bg-card">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center py-3 text-sm font-medium text-muted-foreground border-r border-b border-border"
          >
            {day}
          </div>
        ))}

        {/* Calendar Cells */}
        {activeView === "month" && renderMonthView()}
        {activeView === "week" && renderWeekView()}
        {activeView === "day" && renderDayView()}
        {activeView === "list" && renderListView()}
      </div>

      {/* Mobile: Agenda View */}
      <div className="md:hidden space-y-6">{renderListView()}</div>
    </div>
  );
};

export default CalendarViews;
