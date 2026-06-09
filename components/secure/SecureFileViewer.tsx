'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import { initializeScreenshotPrevention, ScreenshotPreventionConfig } from '@/utils/screenshotPrevention';

interface SecureFileViewerProps {
  materialId: number;
  fileName: string;
  onClose: () => void;
  onSecurityViolation: (type: 'screenshot' | 'download') => void;
}

export default function SecureFileViewer({
  materialId,
  fileName,
  onClose,
  onSecurityViolation
}: SecureFileViewerProps) {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Security monitoring
  useEffect(() => {
    const config: ScreenshotPreventionConfig = {
      onViolationDetected: (type) => {
        console.log(`Security violation detected: ${type}`);
        onSecurityViolation('screenshot');
        setIsBlurred(true);
        
        // Auto-hide content for a few seconds
        setTimeout(() => {
          setIsBlurred(false);
        }, 3000);
      },
      blurOnViolation: true,
      strictMode: true
    };

    const prevention = initializeScreenshotPrevention(config);

    return () => {
      prevention.deactivate();
    };
  }, [onSecurityViolation]);

  // Fetch secure viewing token and URL
  useEffect(() => {
    const fetchSecureUrl = async () => {
      try {
        setLoading(true);
        
        // Get viewing token
        const tokenResponse = await fetch(`/api/materials/${materialId}/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get viewing token');
        }

        const { token } = await tokenResponse.json();

        // Get secure URL
        const urlResponse = await fetch(`/api/materials/secure/${token}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!urlResponse.ok) {
          throw new Error('Failed to get secure URL');
        }

        const { secureUrl: url } = await urlResponse.json();
        setSecureUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load secure content');
      } finally {
        setLoading(false);
      }
    };

    fetchSecureUrl();
  }, [materialId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (secureUrl) {
        // Revoke object URL if it was created
        try {
          URL.revokeObjectURL(secureUrl);
        } catch (e) {
          // Ignore errors for external URLs
        }
      }
    };
  }, [secureUrl]);

  const handleClose = () => {
    setSecureUrl(null);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Preparing Secure View</h3>
          <p className="text-gray-600 text-center">
            Generating secure access token and applying security measures...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Access Denied</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Security Warning Bar */}
      <div className="bg-[#1E88E5] text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span className="font-medium">SECURE VIEW MODE</span>
          <span className="text-green-100">Course Material</span>
        </div>
        <Button
          onClick={handleClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {isBlurred && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <EyeOff className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Content Hidden</h3>
              <p className="text-gray-600 mb-4">
                Content has been hidden due to potential security violation or window focus loss.
              </p>
              <Button
                onClick={() => setIsBlurred(false)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Show Content</span>
              </Button>
            </div>
          </div>
        )}

        <div ref={viewerRef} className="w-full h-full">
          {secureUrl && (
            <iframe
              ref={iframeRef}
              src={secureUrl}
              className="w-full h-full border-0"
              title={fileName}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              allow="fullscreen"
              style={{
                filter: isBlurred ? 'blur(10px)' : 'none',
                pointerEvents: isBlurred ? 'none' : 'auto'
              }}
              onLoad={() => {
                // Additional security measures for iframe content
                try {
                  const iframe = iframeRef.current;
                  if (iframe && iframe.contentDocument) {
                    const doc = iframe.contentDocument;
                    
                    // Disable right-click in iframe
                    doc.addEventListener('contextmenu', (e) => {
                      e.preventDefault();
                      onSecurityViolation('screenshot');
                    });

                    // Disable text selection in iframe
                    doc.body.style.userSelect = 'none';
                    doc.body.style.webkitUserSelect = 'none';
                  }
                } catch (e) {
                  // Cross-origin restrictions may prevent access
                  console.log('Cross-origin iframe security measures applied');
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Footer with file info */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm">{fileName}</span>
        </div>
        <div className="text-xs text-gray-400">
          Secure viewing session • Content protected
        </div>
      </div>
    </div>
  );
}