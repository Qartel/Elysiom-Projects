import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Download, Clock, Calendar, TrendingUp, List, Grid as GridIcon, Copy, Edit, Trash2 } from 'lucide-react';
import ContentPreviewModal from './ContentPreviewModal';

const PlatformTab = ({ platform, content, stats, searchQuery }) => {
  const [view, setView] = useState('kanban');
  const [selectedContent, setSelectedContent] = useState(null);

  const filterContent = (items) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getContentByStatus = (status) => {
    return filterContent(content).filter(item => item.status === status);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'posted': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      post: '📝',
      reel: '🎬',
      story: '📱',
      video: '🎥',
      short: '⚡',
      article: '📄',
      community: '💬',
      text: '✍️',
      poll: '📊',
      event: '📅',
      thread: '🧵'
    };
    return icons[type] || '📄';
  };

  const formatMetric = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

  const renderKanbanView = () => {
    const columns = [
      { id: 'draft', title: 'Drafts', color: 'gray', icon: '📝' },
      { id: 'scheduled', title: 'Scheduled', color: 'blue', icon: '📅' },
      { id: 'posted', title: 'Posted', color: 'green', icon: '✅' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const items = getContentByStatus(column.id);
          return (
            <div key={column.id} className="space-y-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{column.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                  </div>
                  <Badge className={`bg-${column.color}-500/20 text-${column.color}-400 border-${column.color}-500/50`}>
                    {items.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <Card 
                    key={item.id}
                    className="bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 cursor-pointer group content-card"
                    onClick={() => setSelectedContent(item)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-700 text-gray-400"
                          style={{ borderColor: platform.color, color: platform.color }}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {item.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {item.content || item.caption || item.description}
                      </p>

                      {/* Metrics */}
                      {item.status === 'posted' && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-800">
                          {item.views && <span>👁️ {formatMetric(item.views)}</span>}
                          {item.likes && <span>❤️ {formatMetric(item.likes)}</span>}
                          {item.reactions && <span>👍 {formatMetric(item.reactions)}</span>}
                          {item.comments && <span>💬 {item.comments}</span>}
                        </div>
                      )}

                      {/* Date Info */}
                      {item.scheduledDate && (
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}

                      {/* Duration/Read Time */}
                      {(item.duration || item.readTime) && (
                        <div className="text-xs text-gray-500 mb-3">
                          ⏱️ {item.duration || item.readTime}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-gray-700 text-white hover:bg-purple-600 hover:border-purple-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContent(item);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-700 text-white hover:bg-purple-600 hover:border-purple-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-700 text-white hover:bg-purple-600 hover:border-purple-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-xl p-8 text-center">
                    <p className="text-gray-600 text-sm">No content in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGridView = () => {
    const filteredContent = filterContent(content);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-grid">
        {filteredContent.map((item) => (
          <Card 
            key={item.id}
            className="bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 cursor-pointer group content-card"
            onClick={() => setSelectedContent(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
              </div>
              <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                {item.category} • {item.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-lg aspect-square mb-3 flex items-center justify-center border border-gray-800"
                style={{ borderColor: `${platform.color}30` }}
              >
                <span className="text-6xl opacity-50">{getTypeIcon(item.type)}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                {item.content || item.caption || item.description}
              </p>
              {item.scheduledDate && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(item.scheduledDate).toLocaleDateString()}
                </div>
              )}
              {item.status === 'posted' && (
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {item.views && <span>👁️ {formatMetric(item.views)}</span>}
                  {item.likes && <span>❤️ {formatMetric(item.likes)}</span>}
                  {item.reactions && <span>👍 {formatMetric(item.reactions)}</span>}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-white hover:bg-purple-600">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-purple-600">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Platform Stats & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{platform.icon}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: platform.color }}>{platform.name}</h2>
              <p className="text-sm text-gray-500">{stats.total} pieces of content</p>
            </div>
          </div>
          <div className="h-12 w-px bg-gray-800"></div>
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.posted}</div>
              <div className="text-xs text-gray-500">Posted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.scheduled}</div>
              <div className="text-xs text-gray-500">Scheduled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{stats.draft}</div>
              <div className="text-xs text-gray-500">Drafts</div>
            </div>
            {stats.avgEngagement && (
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.avgEngagement}%</div>
                <div className="text-xs text-gray-500">Avg Engagement</div>
              </div>
            )}
            {stats.avgViews && (
              <div>
                <div className="text-2xl font-bold text-purple-400">{formatMetric(stats.avgViews)}</div>
                <div className="text-xs text-gray-500">Avg Views</div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            onClick={() => setView('kanban')}
            className={view === 'kanban' ? 'bg-purple-600' : 'border-gray-800'}
            size="sm"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            onClick={() => setView('grid')}
            className={view === 'grid' ? 'bg-purple-600' : 'border-gray-800'}
            size="sm"
          >
            <GridIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Display */}
      <div className="tabs-content">
        {view === 'kanban' ? renderKanbanView() : renderGridView()}
      </div>

      {/* Preview Modal */}
      {selectedContent && (
        <ContentPreviewModal
          content={selectedContent}
          platform={platform}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default PlatformTab;