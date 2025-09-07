import React, { useState } from "react";
import { format } from "date-fns";
import {
  Package,
  Truck,
  Tag,
  Calendar,
  Clock,
  FileText,
  Edit2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface ShippingEvent {
  id: string;
  tracking_number: string;
  carrier_name: string;
  state_code: string;
  state_name: string;
  ship_date: string;
  scheduled_delivery: string;
  delivery_window_start: string;
  delivery_window_end: string;
  delivery_window_type: "WINDOW" | "EOD";
  account_uid: string;
  account_id: string;
  tracking_url: string;
  status: string;
  tags: string[];
  categories: string[];
  notes?: string;
  score?: number;
}

interface EventDetailDialogProps {
  event?: ShippingEvent;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (event: ShippingEvent) => void;
}

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "DELAYED", label: "Delayed" },
  { value: "EXCEPTION", label: "Exception" },
];

const EventDetailDialog = ({
  event,
  isOpen = true,
  onClose,
  onSave,
}: EventDetailDialogProps) => {
  const defaultEvent: ShippingEvent = {
    id: "temp-id",
    tracking_number: "1Z999AA1234567890",
    carrier_name: "UPS",
    state_code: "CA",
    state_name: "California",
    ship_date: new Date().toISOString(),
    scheduled_delivery: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    delivery_window_start: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    delivery_window_end: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    ).toISOString(),
    delivery_window_type: "WINDOW",
    account_uid: "acc-123",
    account_id: "ACME",
    tracking_url: "https://www.ups.com/track?tracknum=1Z999AA1234567890",
    status: "IN_TRANSIT",
    tags: ["Priority", "Fragile"],
    categories: ["Electronics"],
    notes: "Customer requested delivery notification",
    score: 95,
  };

  const currentEvent = event || defaultEvent;
  const [editedEvent, setEditedEvent] = useState<ShippingEvent>(currentEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  // Detect if we're on mobile
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;

  const handleStatusChange = (value: string) => {
    setEditedEvent((prev) => ({ ...prev, status: value }));
  };

  const handleAddTag = () => {
    if (newTag && !editedEvent.tags.includes(newTag)) {
      setEditedEvent((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditedEvent((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddCategory = () => {
    if (newCategory && !editedEvent.categories.includes(newCategory)) {
      setEditedEvent((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setEditedEvent((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedEvent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(currentEvent);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderContent = () => (
    <div className="bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Tracking</span>
                </div>
                <p className="text-sm">{editedEvent.tracking_number}</p>
                <a
                  href={editedEvent.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-1 block"
                >
                  View on carrier site
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Carrier</span>
                </div>
                <p className="text-sm">{editedEvent.carrier_name}</p>
                <p className="text-sm text-muted-foreground">
                  {editedEvent.account_id} Account
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Ship Date</span>
                </div>
                <p className="text-sm">{formatDate(editedEvent.ship_date)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Delivery Window</span>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Start
                        </label>
                        <Input
                          type="datetime-local"
                          value={new Date(editedEvent.delivery_window_start)
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(e) =>
                            setEditedEvent((prev) => ({
                              ...prev,
                              delivery_window_start: new Date(
                                e.target.value,
                              ).toISOString(),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          End
                        </label>
                        <Input
                          type="datetime-local"
                          value={new Date(editedEvent.delivery_window_end)
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(e) =>
                            setEditedEvent((prev) => ({
                              ...prev,
                              delivery_window_end: new Date(
                                e.target.value,
                              ).toISOString(),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Select
                      value={editedEvent.delivery_window_type}
                      onValueChange={(value) =>
                        setEditedEvent((prev) => ({
                          ...prev,
                          delivery_window_type: value as "WINDOW" | "EOD",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Window Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WINDOW">Time Window</SelectItem>
                        <SelectItem value="EOD">End of Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">
                      {formatDate(editedEvent.delivery_window_start)}
                    </p>
                    {editedEvent.delivery_window_type === "WINDOW" && (
                      <p className="text-sm">
                        to {formatDate(editedEvent.delivery_window_end)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {editedEvent.delivery_window_type === "WINDOW"
                        ? "Time Window"
                        : "End of Day"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Status</span>
                </div>
                {editedEvent.score !== undefined && (
                  <Badge variant="outline" className="ml-auto">
                    Score: {editedEvent.score}
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <Select
                  value={editedEvent.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className={`
                  ${editedEvent.status === "DELIVERED" ? "bg-green-500" : ""}
                  ${editedEvent.status === "IN_TRANSIT" ? "bg-blue-500" : ""}
                  ${editedEvent.status === "DELAYED" || editedEvent.status === "EXCEPTION" ? "bg-red-500" : ""}
                `}
                >
                  {statusOptions.find((o) => o.value === editedEvent.status)
                    ?.label || editedEvent.status}
                </Badge>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Tags</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {editedEvent.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    )}
                  </Badge>
                ))}
                {editedEvent.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No tags added
                  </span>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Categories</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {editedEvent.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {category}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveCategory(category)}
                      />
                    )}
                  </Badge>
                ))}
                {editedEvent.categories.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No categories added
                  </span>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddCategory}>
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Notes</span>
              </div>

              {isEditing ? (
                <Textarea
                  placeholder="Add notes about this shipment"
                  value={editedEvent.notes || ""}
                  onChange={(e) =>
                    setEditedEvent((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={5}
                />
              ) : (
                <div className="p-3 border rounded-md min-h-[100px] text-sm">
                  {editedEvent.notes || "No notes added"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderFooter = () => (
    <div className="flex justify-between items-center w-full">
      {isEditing ? (
        <>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </>
      )}
    </div>
  );

  // Use Sheet on mobile, Dialog on desktop
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md" side="bottom">
        <SheetHeader>
          <SheetTitle>
            {editedEvent.carrier_name} Shipment
            <span className="text-sm font-normal text-muted-foreground block">
              {editedEvent.state_name}
            </span>
          </SheetTitle>
        </SheetHeader>
        {renderContent()}
        <SheetFooter className="mt-6">{renderFooter()}</SheetFooter>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editedEvent.carrier_name} Shipment
            <span className="text-sm font-normal text-muted-foreground block">
              {editedEvent.state_name}
            </span>
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
        <DialogFooter className="mt-6">{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailDialog;
