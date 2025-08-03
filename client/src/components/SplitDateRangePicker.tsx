"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (dateRange: DateRange) => void;
  label?: string;
  disabled?: boolean;
  startDatePlaceholder?: string;
  endDatePlaceholder?: string;
  showClear?: boolean;
  clearButtonText?: string;
  showDescription?: boolean;
  dateFormat?: string;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
  layout?: "horizontal" | "vertical";
}

export function SplitDateRangePicker({
  value,
  onChange,
  label = "Date Range",
  disabled = false,
  startDatePlaceholder = "Pick start date",
  endDatePlaceholder = "Pick end date",
  showClear = true,
  clearButtonText = "Clear dates",
  showDescription = true,
  dateFormat = "PPP",
  maxDate = new Date(),
  minDate,
  className,
  layout = "horizontal"
}: DateRangePickerProps) {
  const [internalValue, setInternalValue] = useState<DateRange>({});

  const currentValue = value !== undefined ? value : internalValue;
  const { startDate, endDate } = currentValue;

  const handleDateChange = (newDateRange: DateRange) => {
    if (value === undefined) {
      setInternalValue(newDateRange);
    }
    onChange?.(newDateRange);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    handleDateChange({ ...currentValue, startDate: date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    handleDateChange({ ...currentValue, endDate: date });
  };

  const handleClear = () => {
    handleDateChange({});
  };

  const hasDateSelected = !!(startDate || endDate);

  const gridClass = layout === "horizontal"
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1";

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Label>
      )}

      <div className={cn("grid gap-4", gridClass)}>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, dateFormat) : startDatePlaceholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                disabled={(date) => {
                  if (maxDate && date > maxDate) return true;
                  if (minDate && date < minDate) return true;
                  if (endDate && date > endDate) return true;
                  return false;
                }}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, dateFormat) : endDatePlaceholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                disabled={(date) => {
                  if (maxDate && date > maxDate) return true;
                  if (minDate && date < minDate) return true;
                  if (startDate && date < startDate) return true;
                  return false;
                }}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {showClear && hasDateSelected && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="shrink-0"
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            {clearButtonText}
          </Button>
        </div>
      )}

      {showDescription && hasDateSelected && (
        <p className="text-xs text-muted-foreground">
          {startDate && endDate
            ? `Selected range: ${format(startDate, dateFormat)} to ${format(endDate, dateFormat)}`
            : startDate
              ? `From ${format(startDate, dateFormat)} onwards`
              : endDate
                ? `Up to ${format(endDate, dateFormat)}`
                : ""
          }
        </p>
      )}
    </div>
  );
}
