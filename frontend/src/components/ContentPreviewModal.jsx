import React from 'react';
import { Button } from './ui/button';
import { X, Download, Copy, Edit, Calendar } from 'lucide-react';
import AnimatedRobot from './AnimatedRobot';

const ContentPreviewModal = ({ content, platform, onClose }) => {
  if (!content) return null;

  const renderPreview = () => {
    // Instagram Content
    if (platform.id === 'instagram') {
      if (content.type === 'reel' || content.type === 'story') {
        return (
          <div className="bg-gradient-to-br from-gray-950 to-black rounded-2xl overflow-hidden aspect-[9/16] max-w-md mx-auto relative border-2 border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-900/10"></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 space-y-6">
              {content.design?.showRobot && (
                <div className="w-48 h-48">
                  <AnimatedRobot />
                </div>
              )}
              <h2 className="text-3xl font-bold text-white text-center">{content.title}</h2>
              <p className="text-gray-300 text-center">{content.caption}</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900"></div>
                <span className="font-semibold text-sm">@elysiom</span>
              </div>
            </div>
          </div>
        );
      }
      
      // Regular post
      return (
        <div className="bg-gradient-to-br from-gray-950 to-black rounded-xl overflow-hidden aspect-square max-w-2xl mx-auto relative border-2 border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-900/10"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
            {content.design?.showRobot && (
              <div className="w-48 h-48 mb-6">
                <AnimatedRobot />
              </div>
            )}
            <h2 className="text-4xl font-bold text-white text-center mb-4">{content.title}</h2>
            <p className="text-xl text-gray-400 text-center">{content.caption}</p>
          </div>
          <div className="absolute bottom-6 right-6 text-sm text-gray-600">@elysiom</div>
        </div>
      );
    }

    // YouTube Content
    if (platform.id === 'youtube') {
      const isShort = content.type === 'short';
      return (
        <div className={`bg-gradient-to-br from-gray-950 to-black rounded-xl overflow-hidden ${isShort ? 'aspect-[9/16] max-w-md' : 'aspect-video max-w-4xl'} mx-auto relative border-2 border-gray-800`}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-900/10"></div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
            <div className="text-8xl mb-6">▶️</div>
            <h2 className="text-3xl font-bold text-white text-center mb-4">{content.title}</h2>
            {content.duration && (
              <div className="bg-black/50 px-3 py-1 rounded text-sm text-white">{content.duration}</div>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white font-semibold mb-2">{content.title}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{content.description}</p>
              {content.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {content.tags.slice(0, 5).map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // LinkedIn Content
    if (platform.id === 'linkedin') {
      return (
        <div className="bg-white rounded-xl max-w-2xl mx-auto border border-gray-300">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <div className="font-semibold text-gray-900">Elysiom</div>
                <div className="text-sm text-gray-600">Agentic Automation • 2h</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{content.title}</h3>
            <div className="text-gray-700 whitespace-pre-wrap mb-4">{content.content}</div>
            {content.type === 'article' && (
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                <div className="text-sm text-gray-600">📄 Article • {content.readTime} read</div>
              </div>
            )}
            {content.hasImage && (
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg aspect-video flex items-center justify-center border border-gray-300">
                <div className="w-32 h-32">
                  <AnimatedRobot />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-4">
              <span className="text-sm text-gray-600">👍 {content.reactions || 0} reactions</span>
              <span className="text-sm text-gray-600">💬 {content.comments || 0} comments</span>
              <span className="text-sm text-gray-600">🔄 {content.shares || 0} shares</span>
            </div>
          </div>
        </div>
      );
    }

    // Facebook Content
    if (platform.id === 'facebook') {
      return (
        <div className="bg-white rounded-xl max-w-2xl mx-auto border border-gray-300">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <div className="font-semibold text-gray-900">Elysiom</div>
                <div className="text-xs text-gray-600">2 hours ago • 🌎</div>
              </div>
            </div>
            <div className="text-gray-900 mb-3">{content.content}</div>
            {(content.type === 'video' || content.type === 'reel') && (
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg aspect-video flex items-center justify-center border border-gray-300">
                <div className="text-6xl">▶️</div>
              </div>
            )}
            {content.type === 'event' && (
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                <div className="text-lg font-semibold text-gray-900 mb-2">📅 {content.title}</div>
                <div className="text-sm text-gray-600">{new Date(content.eventDate).toLocaleString()}</div>
                <div className="text-sm text-gray-700 mt-2">{content.description}</div>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-300 mt-3">
              <span className="text-sm text-gray-600">❤️ {content.reactions || 0}</span>
              <span className="text-sm text-gray-600">💬 {content.comments || 0} comments • 🔄 {content.shares || 0} shares</span>
            </div>
          </div>
        </div>
      );
    }

    // Threads Content
    if (platform.id === 'threads') {
      return (
        <div className="bg-white rounded-xl max-w-xl mx-auto border border-gray-300">
          <div className="p-4">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold">
                E
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">elysiom</div>
                <div className="text-gray-900 mt-2 whitespace-pre-wrap">{content.content}</div>
                {content.type === 'poll' && content.pollOptions && (
                  <div className="mt-4 space-y-2">
                    {content.pollOptions.map((option, idx) => (
                      <div key={idx} className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                        <span className="text-gray-900">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-6 mt-4 text-gray-600 text-sm">
                  <span>❤️ {content.likes || 0}</span>
                  <span>💬 {content.replies || 0}</span>
                  <span>🔄 {content.reposts || 0}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">2h ago</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{content.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span 
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
              >
                {platform.icon} {platform.name}
              </span>
              <span className="text-sm text-gray-400">• {content.type}</span>
              <span className="text-sm text-gray-400">• {content.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-700 text-white hover:bg-purple-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-700 text-white hover:bg-purple-600"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visual Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">PREVIEW</h3>
              {renderPreview()}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">STATUS</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    content.status === 'posted' ? 'bg-green-500/20 text-green-400' :
                    content.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                  </span>
                </div>
              </div>

              {content.scheduledDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    {content.status === 'posted' ? 'POSTED ON' : 'SCHEDULED FOR'}
                  </h3>
                  <div className="flex items-center text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(content.scheduledDate).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              )}

              {content.caption && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">CAPTION</h3>
                  <p className="text-white leading-relaxed">{content.caption}</p>
                </div>
              )}

              {content.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">DESCRIPTION</h3>
                  <p className="text-white leading-relaxed">{content.description}</p>
                </div>
              )}

              {content.status === 'posted' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">PERFORMANCE</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {content.views && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {content.views >= 1000 ? `${(content.views/1000).toFixed(1)}K` : content.views}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                    )}
                    {content.likes && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {content.likes >= 1000 ? `${(content.likes/1000).toFixed(1)}K` : content.likes}
                        </div>
                        <div className="text-xs text-gray-500">Likes</div>
                      </div>
                    )}
                    {content.reactions && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {content.reactions >= 1000 ? `${(content.reactions/1000).toFixed(1)}K` : content.reactions}
                        </div>
                        <div className="text-xs text-gray-500">Reactions</div>
                      </div>
                    )}
                    {content.comments && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{content.comments}</div>
                        <div className="text-xs text-gray-500">Comments</div>
                      </div>
                    )}
                    {content.shares && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{content.shares}</div>
                        <div className="text-xs text-gray-500">Shares</div>
                      </div>
                    )}
                    {content.replies && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{content.replies}</div>
                        <div className="text-xs text-gray-500">Replies</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {content.tags && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewModal;