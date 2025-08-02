import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Send, Image, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, images: string[]) => Promise<void>;
  milestoneTitle: string;
}

const RevisionRequestModal: React.FC<RevisionRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  milestoneTitle,
}) => {
  const t = useT();
  const [feedback, setFeedback] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const maxChars = 1000;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(feedback, images);
      onClose();
      setFeedback('');
      setImages([]);
      setCharCount(0);
    } catch (error) {
      console.error('Error submitting revision request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Revision</h2>
            <p className="text-sm text-gray-600 mt-1">{milestoneTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Revision Request</h4>
                <p className="text-sm text-amber-700">
                  Describe what changes you'd like to see in the deliverable. 
                  Be specific to help the freelancer understand your requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback & Change Requests
            </label>
            <textarea
              value={feedback}
              onChange={handleTextChange}
              placeholder="Please describe the changes you'd like to see. Be as specific as possible..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Be specific about what needs to be changed
              </p>
              <p className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount}/{maxChars}
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="revision-images"
                disabled={submitting}
              />
              <label htmlFor="revision-images" className="cursor-pointer">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Upload reference images or examples
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>
          </div>

          {/* Uploaded Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</p>
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Reference ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={submitting}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Revision Guidelines:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be specific about what needs to be changed</li>
              <li>• Include examples or references when possible</li>
              <li>• Consider the original project scope and requirements</li>
              <li>• Additional fees may apply for scope changes</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={!feedback.trim() || submitting}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {submitting ? 'Sending...' : 'Send Revision Request'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RevisionRequestModal;