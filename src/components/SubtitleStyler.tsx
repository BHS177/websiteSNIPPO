
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubtitleOptions } from '@/types/video';
import { Slider } from "@/components/ui/slider";
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SubtitleStylerProps {
  options: SubtitleOptions;
  onChange: (options: SubtitleOptions) => void;
  className?: string;
}

const SubtitleStyler: React.FC<SubtitleStylerProps> = ({
  options,
  onChange,
  className
}) => {
  const defaultOptions: SubtitleOptions = {
    fontFamily: 'Arial',
    fontSize: 8, // MUCH smaller default font size
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    position: 'middle', // Always middle
    alignment: 'center',
    style: 'standard',
    ...options
  };

  const handleFontFamilyChange = (value: string) => {
    onChange({ ...defaultOptions, fontFamily: value });
  };

  const handleFontSizeChange = (values: number[]) => {
    onChange({ ...defaultOptions, fontSize: values[0] });
  };

  const handleFontColorChange = (color: string) => {
    onChange({ ...defaultOptions, fontColor: color });
  };

  const handleBackgroundColorChange = (color: string) => {
    onChange({ ...defaultOptions, backgroundColor: color });
  };

  const handleAlignmentChange = (value: string) => {
    onChange({ ...defaultOptions, alignment: value as 'left' | 'center' | 'right' });
  };

  const handleStyleChange = (value: string) => {
    onChange({ ...defaultOptions, style: value as 'standard' | 'outline' | 'drop-shadow' });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select 
            value={defaultOptions.fontFamily} 
            onValueChange={handleFontFamilyChange}
          >
            <SelectTrigger id="fontFamily">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Tahoma">Tahoma</SelectItem>
              <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Garamond">Garamond</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Brush Script MT">Brush Script MT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size: {defaultOptions.fontSize}px</Label>
          <Slider 
            id="fontSize"
            value={[defaultOptions.fontSize || 8]} 
            min={4} 
            max={24} 
            step={1}
            onValueChange={handleFontSizeChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fontColor">Font Color</Label>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-input"
                  style={{ backgroundColor: defaultOptions.fontColor }}
                  aria-label="Pick font color"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <HexColorPicker 
                  color={defaultOptions.fontColor} 
                  onChange={handleFontColorChange} 
                />
              </PopoverContent>
            </Popover>
            <Input 
              id="fontColor"
              value={defaultOptions.fontColor} 
              onChange={(e) => handleFontColorChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-input"
                  style={{ backgroundColor: defaultOptions.backgroundColor }}
                  aria-label="Pick background color"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <HexColorPicker 
                  color={defaultOptions.backgroundColor} 
                  onChange={handleBackgroundColorChange} 
                />
              </PopoverContent>
            </Popover>
            <Input 
              id="backgroundColor"
              value={defaultOptions.backgroundColor} 
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alignment">Alignment</Label>
          <Select 
            value={defaultOptions.alignment} 
            onValueChange={handleAlignmentChange}
          >
            <SelectTrigger id="alignment">
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Select 
            value={defaultOptions.style} 
            onValueChange={handleStyleChange}
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="drop-shadow">Drop Shadow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-md">
        <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
          <div 
            className={`px-4 py-2 max-w-[80%] text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              fontFamily: defaultOptions.fontFamily,
              fontSize: `${defaultOptions.fontSize}px`,
              color: defaultOptions.fontColor,
              backgroundColor: `${defaultOptions.backgroundColor}80`, // Add alpha for semi-transparency
              textAlign: defaultOptions.alignment as any,
              textShadow: defaultOptions.style === 'drop-shadow' ? '2px 2px 2px rgba(0,0,0,0.8)' : 'none',
              WebkitTextStroke: defaultOptions.style === 'outline' ? '1px black' : 'none',
              borderRadius: '4px',
            }}
          >
            Sample Subtitle Text
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleStyler;
