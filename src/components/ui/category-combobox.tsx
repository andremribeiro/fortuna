'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CATEGORIES } from '@/lib/categories'

interface CategoryComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSelect = (selected: string) => {
    onChange(selected)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      handleSelect(inputValue)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || 'Select or type category'}
          <ChevronsUpDown size={14} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="max-h-64">
          <CommandInput
            placeholder="Search or type custom..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList style={{ maxHeight: '180px', overflowY: 'auto' }} onWheel={(e) => e.stopPropagation()}>
            <CommandEmpty
              className="py-3 px-4 text-sm cursor-pointer hover:bg-muted"
              onClick={() => inputValue && handleSelect(inputValue)}
            >
              Use &quot;{inputValue}&quot;
            </CommandEmpty>
            <CommandGroup>
              {CATEGORIES.map((cat) => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={() => handleSelect(cat)}
                >
                  <Check
                    size={14}
                    className={cn(
                      'mr-2',
                      value === cat ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {cat}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}