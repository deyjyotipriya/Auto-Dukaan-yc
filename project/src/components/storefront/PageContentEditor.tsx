import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PageConfig, 
  SectionConfig, 
  SectionType 
} from '../../services/StorefrontService';
import { 
  HomeIcon, 
  LayoutGrid, 
  Image, 
  MessageSquare, 
  ShoppingBag,
  Tags, 
  Info, 
  Film, 
  HelpCircle, 
  MailIcon,
  Plus,
  Trash,
  GripVertical,
  Eye
} from 'lucide-react';

interface PageContentEditorProps {
  pages: PageConfig[];
  onUpdate?: (updatedPages: PageConfig[]) => void;
}

const PageContentEditor: React.FC<PageContentEditorProps> = ({
  pages,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState(pages[0]?.type || '');
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [sections, setSections] = useState<SectionConfig[]>(
    pages.find(p => p.type === activePage)?.sections || []
  );

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case SectionType.HERO:
        return <HomeIcon className="h-5 w-5" />;
      case SectionType.FEATURED_PRODUCTS:
        return <ShoppingBag className="h-5 w-5" />;
      case SectionType.CATEGORIES:
        return <Tags className="h-5 w-5" />;
      case SectionType.TESTIMONIALS:
        return <MessageSquare className="h-5 w-5" />;
      case SectionType.ABOUT:
        return <Info className="h-5 w-5" />;
      case SectionType.CONTACT_FORM:
        return <MailIcon className="h-5 w-5" />;
      case SectionType.IMAGE_GALLERY:
        return <Image className="h-5 w-5" />;
      case SectionType.VIDEO:
        return <Film className="h-5 w-5" />;
      case SectionType.FAQ:
        return <HelpCircle className="h-5 w-5" />;
      case SectionType.NEWSLETTER:
        return <MailIcon className="h-5 w-5" />;
      default:
        return <LayoutGrid className="h-5 w-5" />;
    }
  };

  const handlePageChange = (pageType: string) => {
    setActivePage(pageType);
    const pageConfig = pages.find(p => p.type === pageType);
    setSections(pageConfig?.sections || []);
    setEditingSectionIndex(null);
  };

  const handleAddSection = () => {
    const newSection: SectionConfig = {
      type: SectionType.HERO,
      enabled: true,
      order: sections.length,
      settings: {}
    };
    
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    setEditingSectionIndex(updatedSections.length - 1);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const handleRemoveSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
    setEditingSectionIndex(null);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    
    const updatedSections = [...sections];
    const [removed] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, removed);
    
    // Update order values
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setSections(reorderedSections);
    setEditingSectionIndex(toIndex);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: reorderedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const handleToggleSectionEnabled = (index: number) => {
    const updatedSections = [...sections];
    updatedSections[index].enabled = !updatedSections[index].enabled;
    
    setSections(updatedSections);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const handleUpdateSectionTitle = (index: number, title: string) => {
    const updatedSections = [...sections];
    updatedSections[index].title = title;
    
    setSections(updatedSections);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const handleChangeSectionType = (index: number, type: SectionType) => {
    const updatedSections = [...sections];
    updatedSections[index].type = type;
    
    // Reset settings when changing section type
    updatedSections[index].settings = {};
    
    setSections(updatedSections);
    
    if (onUpdate) {
      const updatedPages = pages.map(page => {
        if (page.type === activePage) {
          return {
            ...page,
            sections: updatedSections
          };
        }
        return page;
      });
      
      onUpdate(updatedPages);
    }
  };

  const getActivePage = () => {
    return pages.find(p => p.type === activePage);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.pageContent.title')}</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {pages.map((page) => (
            <Button
              key={page.type}
              variant={activePage === page.type ? "default" : "outline"}
              onClick={() => handlePageChange(page.type)}
              className="flex items-center"
              size="sm"
            >
              {page.title}
            </Button>
          ))}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">
              {getActivePage()?.title} {t('storefront.pageContent.sections')}
            </h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddSection}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('storefront.pageContent.addSection')}
            </Button>
          </div>
          
          {sections.length > 0 ? (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div 
                  key={index}
                  className={`
                    border rounded-md overflow-hidden
                    ${editingSectionIndex === index ? 'ring-2 ring-primary/20' : ''}
                    ${!section.enabled ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-center p-3 bg-gray-50 border-b">
                    <div className="flex items-center space-x-2 cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div className="text-gray-600">
                        {getSectionIcon(section.type)}
                      </div>
                    </div>
                    
                    <div className="ml-2 flex-1">
                      <span className="font-medium">
                        {section.title || t(`storefront.sectionTypes.${section.type}`)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={section.enabled ? 'text-green-600' : 'text-gray-400'}
                        onClick={() => handleToggleSectionEnabled(index)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSectionIndex(editingSectionIndex === index ? null : index)}
                      >
                        {editingSectionIndex === index ? t('common.close') : t('common.edit')}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveSection(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingSectionIndex === index && (
                    <div className="p-4 border-t">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('storefront.pageContent.sectionType')}
                          </label>
                          <select
                            value={section.type}
                            onChange={(e) => handleChangeSectionType(index, e.target.value as SectionType)}
                            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-1 focus:ring-primary focus:border-primary"
                          >
                            {Object.values(SectionType).map((type) => (
                              <option key={type} value={type}>
                                {t(`storefront.sectionTypes.${type}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('storefront.pageContent.sectionTitle')}
                          </label>
                          <Input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => handleUpdateSectionTitle(index, e.target.value)}
                            placeholder={t('storefront.pageContent.sectionTitlePlaceholder')}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {t('storefront.pageContent.sectionTitleHelp')}
                          </p>
                        </div>
                        
                        {/* Section-specific settings would go here */}
                        <div>
                          <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                            {t('storefront.pageContent.sectionSettingsInfo')}
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSectionIndex(null)}
                          >
                            {t('common.close')}
                          </Button>
                          
                          <Button
                            size="sm"
                          >
                            {t('common.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-gray-500 mb-2">{t('storefront.pageContent.noSections')}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddSection}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('storefront.pageContent.addFirstSection')}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.pageContent.navigation')}</h3>
        <p className="text-sm text-gray-600">
          {t('storefront.pageContent.navigationDescription')}
        </p>
        
        {/* Navigation configuration would go here */}
      </div>
    </div>
  );
};

export default PageContentEditor;