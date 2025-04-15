import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Facebook, Twitter, Instagram, Linkedin, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ShareOptionsMenuProps {
  videoUrl: string | null;
}

const ShareOptionsMenu: React.FC<ShareOptionsMenuProps> = ({ videoUrl }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast.error("Failed to copy");
      console.error('Failed to copy: ', err);
    });
  };
  
  const shareViaUrl = (platform: string) => {
    if (!videoUrl) return;
    
    const shareUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent("Check out my AI-generated video!");
    
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    toast.success(`Sharing to ${platform}`);
  };
  
  const downloadVideo = async () => {
    if (!videoUrl) {
      toast.error("No video available to download");
      return;
    }
    
    setIsDownloading(true);
    
    try {
      toast.info("Preparing download...");
      
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      
      const fileType = 'video/mp4';
      
      const file = new File([videoBlob], "my-video.mp4", { 
        type: fileType 
      });
      
      const downloadUrl = URL.createObjectURL(file);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'my-video.mp4';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      toast.success("Download started", {
        description: "Your video is downloading as MP4 format. Check your downloads folder."
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        description: "There was an error downloading your video. Please try again or check console for details."
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-2">
      <div className="relative">
        <Input 
          value={window.location.href} 
          readOnly 
          className="pr-10"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 top-0"
          onClick={() => copyToClipboard(window.location.href)}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center py-6 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          onClick={() => shareViaUrl('facebook')}
        >
          <Facebook className="h-8 w-8 mb-2" />
          <span>Facebook</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center py-6 hover:bg-blue-50 hover:text-blue-400 hover:border-blue-200"
          onClick={() => shareViaUrl('twitter')}
        >
          <Twitter className="h-8 w-8 mb-2" />
          <span>Twitter</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center py-6 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
          onClick={() => {
            toast("Instagram sharing", {
              description: "Save the video first then upload to Instagram"
            });
          }}
        >
          <Instagram className="h-8 w-8 mb-2" />
          <span>Instagram</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center py-6 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          onClick={() => shareViaUrl('linkedin')}
        >
          <Linkedin className="h-8 w-8 mb-2" />
          <span>LinkedIn</span>
        </Button>
      </div>
      
      <div className="mt-6">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={downloadVideo}
          disabled={isDownloading || !videoUrl}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Video (MP4)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShareOptionsMenu;
