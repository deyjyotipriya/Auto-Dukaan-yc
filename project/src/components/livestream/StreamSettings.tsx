import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Settings, Globe, ShieldCheck, Video, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  setStreamVisibility, 
  setStreamQuality 
} from '../../store/slices/livestreamSlice';
import { 
  StreamVisibility, 
  StreamQuality 
} from '../../services/LivestreamService';
import { AppDispatch } from '../../store';

interface StreamSettingsProps {
  streamTitle: string;
  streamDescription: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

const StreamSettings: React.FC<StreamSettingsProps> = ({
  streamTitle,
  streamDescription,
  onTitleChange,
  onDescriptionChange
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [title, setTitle] = useState(streamTitle);
  const [description, setDescription] = useState(streamDescription);
  const [visibility, setVisibility] = useState<StreamVisibility>(StreamVisibility.PUBLIC);
  const [quality, setQuality] = useState<StreamQuality>(StreamQuality.HIGH);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [productDetectionEnabled, setProductDetectionEnabled] = useState(true);
  const [recordEnabled, setRecordEnabled] = useState(true);
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };
  
  // Handle visibility change
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVisibility = e.target.value as StreamVisibility;
    setVisibility(newVisibility);
    dispatch(setStreamVisibility(newVisibility));
  };
  
  // Handle quality change
  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuality = e.target.value as StreamQuality;
    setQuality(newQuality);
    dispatch(setStreamQuality(newQuality));
  };
  
  // Save changes
  const saveChanges = () => {
    onTitleChange(title);
    onDescriptionChange(description);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium flex items-center">
        <Settings className="h-5 w-5 mr-2" />
        {t('livestream.settings.title')}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('livestream.settings.streamTitle')}
          </label>
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={t('livestream.settings.streamTitlePlaceholder')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('livestream.settings.streamDescription')}
          </label>
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t('livestream.settings.streamDescriptionPlaceholder')}
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Globe className="h-4 w-4 mr-1.5" />
            {t('livestream.settings.visibility')}
          </label>
          <select
            value={visibility}
            onChange={handleVisibilityChange}
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value={StreamVisibility.PUBLIC}>{t('livestream.settings.visibilityPublic')}</option>
            <option value={StreamVisibility.UNLISTED}>{t('livestream.settings.visibilityUnlisted')}</option>
            <option value={StreamVisibility.PRIVATE}>{t('livestream.settings.visibilityPrivate')}</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {visibility === StreamVisibility.PUBLIC && t('livestream.settings.visibilityPublicHelp')}
            {visibility === StreamVisibility.UNLISTED && t('livestream.settings.visibilityUnlistedHelp')}
            {visibility === StreamVisibility.PRIVATE && t('livestream.settings.visibilityPrivateHelp')}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Video className="h-4 w-4 mr-1.5" />
            {t('livestream.settings.quality')}
          </label>
          <select
            value={quality}
            onChange={handleQualityChange}
            className="block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value={StreamQuality.LOW}>{t('livestream.settings.qualityLow')}</option>
            <option value={StreamQuality.MEDIUM}>{t('livestream.settings.qualityMedium')}</option>
            <option value={StreamQuality.HIGH}>{t('livestream.settings.qualityHigh')}</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {quality === StreamQuality.LOW && t('livestream.settings.qualityLowHelp')}
            {quality === StreamQuality.MEDIUM && t('livestream.settings.qualityMediumHelp')}
            {quality === StreamQuality.HIGH && t('livestream.settings.qualityHighHelp')}
          </p>
        </div>
        
        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('livestream.settings.enableChat')}
              </span>
            </div>
            <Switch
              checked={chatEnabled}
              onCheckedChange={setChatEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1.5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('livestream.settings.enableProductDetection')}
              </span>
            </div>
            <Switch
              checked={productDetectionEnabled}
              onCheckedChange={setProductDetectionEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1.5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('livestream.settings.enableRecording')}
              </span>
            </div>
            <Switch
              checked={recordEnabled}
              onCheckedChange={setRecordEnabled}
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={saveChanges}>
            {t('common.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Fix missing import
function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default StreamSettings;