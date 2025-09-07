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
      ups: "bg-amber-700",
      fedex: "bg-purple-700",
      usps: "bg-blue-700",
      dhl: "bg-yellow-600",
    };
    return carrierColors[carrier.toLowerCase()] || "bg-gray-500";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      delivered: "bg-green-500",
      inTransit: "bg-blue-500",
      pending: "bg-gray-400",
      delayed: "bg-red-500",
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
                  "min-h-[100px] p-1 border border-border",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isToday(day) && "bg-muted/50",
                  "hover:bg-accent/10 cursor-pointer",
                )}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday(day) &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="mt-1 space-y-1 max-h-[80px] overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-xs px-2 py-1 rounded truncate flex items-center gap-1",
                        getCarrierColor(event.carrier),
                        "text-white",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick && onEventClick(event);
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-2">
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
                      <Card
                        key={idx}
                        className="p-3 hover:bg-accent/5 cursor-pointer"
                        onClick={() => onEventClick && onEventClick(event)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              getCarrierColor(event.carrier),
                            )}
                          ></div>
                          <div className="flex-1">
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{timeDisplay}</span>
                              <span>•</span>
                              <span>{event.trackingNumber}</span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              getStatusColor(event.status),
                              "text-white",
                            )}
                          >
                            {event.status}
                          </div>
                        </div>
                      </Card>
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
    <div className="bg-background rounded-lg border border-border">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {activeView === "month" && format(currentDate, "MMMM yyyy")}
            {activeView === "week" &&
              `Week of ${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`}
            {activeView === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
            {activeView === "list" && "Shipping Events"}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="month" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Month</span>
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Week</span>
            </TabsTrigger>
            <TabsTrigger value="day" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Day</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar Content */}
      <div className="h-[calc(100vh-250px)] overflow-auto">
        {activeView === "month" && renderMonthView()}
        {activeView === "week" && renderWeekView()}
        {activeView === "day" && renderDayView()}
        {activeView === "list" && renderListView()}
      </div>
    </div>
  );
};

export default CalendarViews;
