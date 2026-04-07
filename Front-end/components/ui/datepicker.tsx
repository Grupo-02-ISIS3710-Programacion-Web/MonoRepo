"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerSimpleProps = {
    value?: Date
    onChange?: (date?: Date) => void
    placeholder?: string
    className?: string
}

export function DatePickerSimple({
    value,
    onChange,
    placeholder = "Select date",
    className,
}: DatePickerSimpleProps) {
    const [open, setOpen] = React.useState(false)
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(undefined)
    const isControlled = typeof onChange === "function"
    const selectedDate = isControlled ? value : internalDate

    const handleSelect = (date?: Date) => {
        if (isControlled) {
            onChange?.(date)
        } else {
            setInternalDate(date)
        }
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    id="date"
                    className={className ?? "w-full justify-start font-normal"}
                >
                    {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    captionLayout="dropdown"
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    )
}
