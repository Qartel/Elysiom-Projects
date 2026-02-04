import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Settings, BarChart3, Calendar, Copy } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { platforms, contentLibrary, platformStats, getTotalStats } from './socialMediaContent';
import PlatformTab from './components/PlatformTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SocialFlow = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const totalStats = getTotalStats();

  useEffect(() => {
    // Initialize app
    setLoading(false);
    // TODO: Fetch content from backend
  }, []);

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">SocialFlow</span>
                </h1>
                <p className="text-sm text-gray-400">Multi-Platform Content Hub</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </div>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-400">{totalStats.total}</div>
                <div className="text-xs text-gray-500">Total Content</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-400">{totalStats.posted}</div>
                <div className="text-xs text-gray-500">Posted</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-400">{totalStats.scheduled}</div>
                <div className="text-xs text-gray-500">Scheduled</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-gray-400">{totalStats.draft}</div>
                <div className="text-xs text-gray-500">Drafts</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-400">5</div>
                <div className="text-xs text-gray-500">Platforms</div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Tabs */}
          <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
            <TabsList className="w-full justify-start bg-gray-900/50 border border-gray-800 p-1">
              {platforms.map((platform) => (
                <TabsTrigger
                  key={platform.id}
                  value={platform.id}
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${platform.gradient} data-[state=active]:text-white px-6 py-2.5 relative group`}
                >
                  <span className="text-xl mr-2">{platform.icon}</span>
                  <span className="font-medium">{platform.name}</span>
                  <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                    {platformStats[platform.id].total}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1800px] mx-auto px-6 py-8 w-full">
        {/* Search & Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder={`Search ${currentPlatform.name} content...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 text-white"
            />
          </div>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate to Other Platforms
          </Button>
        </div>

        {/* Platform-Specific Content */}
        <Tabs value={selectedPlatform} className="w-full">
          {platforms.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
              <PlatformTab
                platform={platform}
                content={contentLibrary[platform.id]}
                stats={platformStats[platform.id]}
                searchQuery={searchQuery}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Footer - Powered by Elysiom */}
      <footer className="border-t border-gray-800 bg-gray-950 py-6 mt-auto">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              © 2024 SocialFlow. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Powered by</span>
              <a 
                href="https://elysiom.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <span className="font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-500 transition-all duration-300">
                  Elysiom
                </span>
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SocialFlow;