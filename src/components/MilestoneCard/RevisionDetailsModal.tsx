import React from 'react';
import { MessageSquare, Image, Calendar, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { RevisionData } from '@/lib/revisionUtils';

interface RevisionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionData: RevisionData;
  onMarkAddressed: (requestId: string) => void;
  milestoneTitle: string;
  isClientView?: boolean;
}

const RevisionDetailsModal = ({
  isOpen,
  onClose,
  revisionData,
  onMarkAddressed,
  milestoneTitle,
  isClientView = false,
}) => {
  const pendingRequests = revisionData.requests.filter(req => req.status === 'pending');
  const addressedRequests = revisionData.requests.filter(req => req.status === 'addressed');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Revision Requests - {milestoneTitle}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {revisionData.requests.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {pendingRequests.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {addressedRequests.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Addressed</div>
                </div>
              </div>
            </div>

            {!revisionData.requests.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No revision requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 text-amber-600">
                      Pending Requests ({pendingRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border rounded-lg p-4 bg-amber-50/50 border-amber-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                Pending
                              </Badge>
                               <span className="text-sm text-muted-foreground">
                                 <Calendar className="w-3 h-3 inline mr-1" />
                                 {request.requestedAt && !isNaN(Date.parse(request.requestedAt)) 
                                   ? formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })
                                   : 'Recently'}
                               </span>
                             </div>
                             {!isClientView && (
                               <Button
                                 size="sm"
                                 onClick={() => onMarkAddressed(request.id)}
                                 className="gap-1.5"
                               >
                                 <Check className="w-3 h-3" />
                                 Mark as Addressed
                               </Button>
                             )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{request.feedback}</p>
                          {request.images.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Image className="w-4 h-4" />
                                {request.images.length} attached image{request.images.length > 1 ? 's' : ''}
                              </div>
                               <div className="grid grid-cols-3 gap-2">
                                 {request.images.map((imageUrl, index) => (
                                   <div
                                     key={index}
                                     className="aspect-square bg-muted rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                     onClick={() => window.open(imageUrl, '_blank')}
                                   >
                                     <img
                                       src={imageUrl}
                                       alt={`Revision image ${index + 1}`}
                                       className="w-full h-full object-cover"
                                       onError={(e) => {
                                         // Fallback to icon if image fails to load
                                         e.currentTarget.style.display = 'none';
                                         e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                       }}
                                     />
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addressed Requests */}
                {addressedRequests.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 text-green-600">
                      Addressed Requests ({addressedRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {addressedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border rounded-lg p-4 bg-green-50/50 border-green-200 opacity-75"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Addressed
                            </Badge>
                             <span className="text-sm text-muted-foreground">
                               <Calendar className="w-3 h-3 inline mr-1" />
                               {request.requestedAt && !isNaN(Date.parse(request.requestedAt)) 
                                 ? formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })
                                 : 'Recently'}
                             </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{request.feedback}</p>
                           {request.images.length > 0 && (
                             <div className="mt-3">
                               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                 <Image className="w-4 h-4" />
                                 {request.images.length} attached image{request.images.length > 1 ? 's' : ''}
                               </div>
                               <div className="grid grid-cols-3 gap-2">
                                 {request.images.map((imageUrl, index) => (
                                   <div
                                     key={index}
                                     className="aspect-square bg-muted rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                     onClick={() => window.open(imageUrl, '_blank')}
                                   >
                                     <img
                                       src={imageUrl}
                                       alt={`Revision image ${index + 1}`}
                                       className="w-full h-full object-cover"
                                       onError={(e) => {
                                         // Fallback to icon if image fails to load
                                         e.currentTarget.style.display = 'none';
                                         e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                       }}
                                     />
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionDetailsModal;