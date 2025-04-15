
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import captionService from '@/services/captionService';
import { ProductAdvertisementSettings, AdProductType } from '@/types/video';
import { useProductDescription } from './use-product-description';

// This hook will provide a way to integrate our product description feature
// with the existing VideoCreativeFactory component
export const useVideoFactoryIntegration = () => {
  const [productAdSettings, setProductAdSettings] = useState<Partial<ProductAdvertisementSettings>>({});
  const {
    productDescription,
    setProductDescription,
    isApplyingDescription,
    applyProductDescription
  } = useProductDescription();
  
  // Auto-detect settings from product description
  const autoDetectSettings = () => {
    if (!productDescription.trim()) {
      toast.error('Please add a product description first');
      return;
    }
    
    // Extract product type
    const productType = captionService.extractProductType ? 
      captionService.extractProductType(productDescription) : 
      detectProductType(productDescription);
    
    // Parse description for selling points
    const sellingPoints = parseSellingPoints(productDescription);
    
    // Determine mood
    const mood = determineMood(productDescription);
    
    // Generate a call to action
    const callToAction = generateCallToAction(productType);
    
    // Set detected settings
    setProductAdSettings({
      productType,
      keySellingPoints: sellingPoints,
      mood,
      callToAction,
      targetAudience: detectTargetAudience(productDescription)
    });
    
    toast.success('Settings detected from your product description');
  };
  
  // Fallback function to detect product type if service method isn't available
  const detectProductType = (description: string): AdProductType => {
    const lowerDesc = description.toLowerCase();
    
    if (/tech|electronic|device|gadget|computer|phone/i.test(lowerDesc)) {
      return 'electronics';
    } else if (/cloth|apparel|shirt|dress|fashion/i.test(lowerDesc)) {
      return 'clothing';
    } else if (/shoe|sneaker|boot/i.test(lowerDesc)) {
      return 'footwear';
    } else if (/jewel|ring|necklace|watch|bracelet/i.test(lowerDesc)) {
      return 'jewelry';
    } else if (/bag|purse|accessory|wallet|sunglasses/i.test(lowerDesc)) {
      return 'accessories';
    }
    
    return 'products';
  };
  
  // Parse selling points from description
  const parseSellingPoints = (description: string): string[] => {
    const points: string[] = [];
    
    // Try to extract bullet points
    const bulletMatches = description.match(/[•\-\*]\s*([^•\-\*\n]+)/g);
    if (bulletMatches?.length) {
      bulletMatches.slice(0, 3).forEach(point => {
        const cleaned = point.replace(/^[•\-\*]\s*/, '').trim();
        if (cleaned && cleaned.length > 5) {
          points.push(cleaned);
        }
      });
    }
    
    // If no bullet points, try to extract sentences with key features
    if (points.length === 0) {
      const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      const featureSentences = sentences.filter(s => 
        /feature|benefit|advantage|quality|unique|special|best/i.test(s)
      );
      
      if (featureSentences.length) {
        points.push(...featureSentences.slice(0, 3));
      } else if (sentences.length) {
        // Just take the first 2-3 sentences if no clear feature sentences
        points.push(...sentences.slice(0, Math.min(3, sentences.length)));
      }
    }
    
    return points;
  };
  
  // Determine the mood from the description
  const determineMood = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    if (/luxury|premium|exclusive|elegant|sophisticated/i.test(lowerDesc)) {
      return 'elegant';
    } else if (/tech|innovative|cutting-edge|advanced|modern/i.test(lowerDesc)) {
      return 'inspirational';
    } else if (/fun|exciting|vibrant|young|dynamic/i.test(lowerDesc)) {
      return 'playful';
    } else if (/professional|business|reliable|trusted|serious/i.test(lowerDesc)) {
      return 'corporate';
    } else if (/calm|peaceful|natural|organic|sustainable/i.test(lowerDesc)) {
      return 'relaxed';
    }
    
    return 'upbeat'; // Default mood
  };
  
  // Generate a call to action based on product type
  const generateCallToAction = (productType: AdProductType): string => {
    const ctas: Record<string, string[]> = {
      'electronics': ['Upgrade Today', 'Experience the Future', 'Transform Your Digital Life'],
      'clothing': ['Elevate Your Style', 'Wear Excellence', 'Redefine Your Fashion'],
      'footwear': ['Step Up Your Game', 'Walk in Comfort', 'Stride with Confidence'],
      'jewelry': ['Shine Brighter', 'Elegance Awaits', 'Make Every Moment Special'],
      'accessories': ['Complete Your Look', 'Stand Out from the Crowd', 'Express Yourself']
    };
    
    const options = ctas[productType as string] || ['Shop Now', 'Learn More', 'Discover Today'];
    return options[Math.floor(Math.random() * options.length)];
  };
  
  // Detect target audience from description
  const detectTargetAudience = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    if (/professional|business|executive|office/i.test(lowerDesc)) {
      return 'Business Professionals';
    } else if (/young|youth|teen|student/i.test(lowerDesc)) {
      return 'Young Adults';
    } else if (/parent|family|child|kid/i.test(lowerDesc)) {
      return 'Families';
    } else if (/active|fitness|sport|athlete/i.test(lowerDesc)) {
      return 'Active Individuals';
    } else if (/luxury|premium|high-end|sophisticated/i.test(lowerDesc)) {
      return 'Luxury Consumers';
    } else if (/tech|gadget|innovation|early adopter/i.test(lowerDesc)) {
      return 'Tech Enthusiasts';
    }
    
    return 'General Consumers';
  };
  
  return {
    productDescription,
    setProductDescription,
    isApplyingDescription,
    applyProductDescription,
    productAdSettings,
    setProductAdSettings,
    autoDetectSettings
  };
};

export default useVideoFactoryIntegration;
