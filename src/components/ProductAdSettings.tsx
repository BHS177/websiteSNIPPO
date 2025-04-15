
import { useState } from "react";
import { Settings2, Target, Sparkles, PenTool, Heart, BrainCircuit } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductAdvertisementSettings, AdProductType } from "@/types/video";

interface ProductAdSettingsProps {
  settings: Partial<ProductAdvertisementSettings>;
  onSettingsChange: (settings: Partial<ProductAdvertisementSettings>) => void;
  onAutoDetect: () => void;
  productDescription: string;
}

const productTypes: AdProductType[] = [
  'electronics', 
  'clothing', 
  'footwear', 
  'jewelry', 
  'accessories',
  'software',
  'food',
  'beauty',
  'health',
  'home'
];

const moods = [
  'energetic',
  'upbeat',
  'inspirational',
  'corporate',
  'elegant',
  'playful',
  'dramatic',
  'emotional',
  'cinematic',
  'relaxed'
];

const ProductAdSettings = ({ 
  settings,
  onSettingsChange,
  onAutoDetect,
  productDescription
}: ProductAdSettingsProps) => {
  const [keyPoint, setKeyPoint] = useState("");

  const addKeyPoint = () => {
    if (keyPoint.trim()) {
      const newKeyPoints = [
        ...(settings.keySellingPoints || []),
        keyPoint.trim()
      ];
      onSettingsChange({ ...settings, keySellingPoints: newKeyPoints });
      setKeyPoint("");
    }
  };

  const removeKeyPoint = (index: number) => {
    const newKeyPoints = [...(settings.keySellingPoints || [])];
    newKeyPoints.splice(index, 1);
    onSettingsChange({ ...settings, keySellingPoints: newKeyPoints });
  };

  return (
    <div className="w-full border border-indigo-500/20 rounded-lg p-4 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Settings2 className="h-5 w-5 mr-2 text-indigo-400" />
          <h3 className="text-lg font-medium text-white">Advertisement Settings</h3>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1 border-indigo-500/30 text-indigo-300"
          onClick={onAutoDetect}
          disabled={!productDescription.trim()}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          Auto-Detect
        </Button>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-indigo-500/20">
          <AccordionTrigger className="text-white hover:text-indigo-300">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Product Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productType" className="text-white">Product Type</Label>
                <Select
                  value={settings.productType}
                  onValueChange={(value) => onSettingsChange({ ...settings, productType: value as AdProductType })}
                >
                  <SelectTrigger className="bg-black/50 border-indigo-500/30 text-white">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-indigo-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-white">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={settings.targetAudience || ""}
                  onChange={(e) => onSettingsChange({ ...settings, targetAudience: e.target.value })}
                  placeholder="e.g., Young professionals, tech enthusiasts"
                  className="bg-black/50 border-indigo-500/30 text-white"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border-indigo-500/20">
          <AccordionTrigger className="text-white hover:text-indigo-300">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Key Selling Points</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={keyPoint}
                  onChange={(e) => setKeyPoint(e.target.value)}
                  placeholder="Add a key selling point"
                  className="bg-black/50 border-indigo-500/30 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyPoint();
                    }
                  }}
                />
                <Button onClick={addKeyPoint} variant="outline" className="border-indigo-500/30">
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {settings.keySellingPoints?.map((point, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded-md bg-indigo-950/30 border border-indigo-500/20"
                  >
                    <span className="text-white text-sm">{point}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 rounded-full hover:bg-red-900/30"
                      onClick={() => removeKeyPoint(index)}
                    >
                      <span className="sr-only">Remove</span>
                      <span className="text-red-400">×</span>
                    </Button>
                  </div>
                ))}
                
                {!settings.keySellingPoints?.length && (
                  <p className="text-gray-400 text-sm italic">No selling points added yet</p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border-indigo-500/20">
          <AccordionTrigger className="text-white hover:text-indigo-300">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Mood & Style</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-white">Advertisement Mood</Label>
                <Select
                  value={settings.mood}
                  onValueChange={(value) => onSettingsChange({ ...settings, mood: value })}
                >
                  <SelectTrigger className="bg-black/50 border-indigo-500/30 text-white">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-500/30">
                    {moods.map((mood) => (
                      <SelectItem key={mood} value={mood} className="text-white hover:bg-indigo-900">
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4" className="border-indigo-500/20">
          <AccordionTrigger className="text-white hover:text-indigo-300">
            <div className="flex items-center">
              <PenTool className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Call to Action</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Label htmlFor="callToAction" className="text-white">Call To Action Text</Label>
              <Input
                id="callToAction"
                value={settings.callToAction || ""}
                onChange={(e) => onSettingsChange({ ...settings, callToAction: e.target.value })}
                placeholder="e.g., Shop now, Learn more, Get started today"
                className="bg-black/50 border-indigo-500/30 text-white"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductAdSettings;
